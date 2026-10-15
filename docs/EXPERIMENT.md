# 实验文档：比亚迪后复权历史行情移动端数据看板

## 1. 实验目标

本实验读取比亚迪 2023 年后复权历史行情 Excel，完成数据校验、描述性统计、
移动端可视化和自动化测试。最终页面是一个可直接打开的静态 HTML 看板，适合
在手机或浏览器的移动设备模式下截图和展示。

页面重点回答以下问题：

1. 比亚迪 2023 年后复权收盘价整体如何变化？
2. 年度高点、低点、均值、波动率与成交活跃度分别是多少？
3. 不同观察区间下，价格趋势和成交量如何变化？
4. 原始数据是否完整、日期是否唯一、关键字段是否存在缺失？

## 2. 数据说明

数据文件：

```text
data/source/比亚迪后复权历史行情数据.xlsx
```

工作表：`Sheet2`

字段：

| 字段 | 含义 | 单位 |
| --- | --- | --- |
| 日期 | 交易日 | 日期 |
| 开盘 | 后复权开盘价 | 元 |
| 收盘 | 后复权收盘价 | 元 |
| 最高 | 当日最高价 | 元 |
| 最低 | 当日最低价 | 元 |
| 成交量 | 当日成交量 | 手 |
| 成交额 | 当日成交额 | 元 |
| 振幅 | 当日振幅 | % |
| 涨跌幅 | 较前一交易日涨跌幅 | % |
| 涨跌额 | 较前一交易日涨跌额 | 元 |
| 换手率 | 当日换手率 | % |

数据校验结果：

- 日期范围：2023-01-03 至 2023-12-29
- 有效交易日：242 条
- 字段数量：11 个
- 日期重复：0
- 关键字段空值：0

## 3. 数据预处理与统计口径

`scripts/build_data.py` 使用 `openpyxl` 显式读取第一行表头和后续记录，
执行序列完整性、字段类型、数值范围和日期唯一性检查，然后生成
`data/byd_2023.js`。

主要统计公式：

```text
区间收益率 = (区间末收盘价 / 区间首收盘价 - 1) × 100%
收盘均值 = Σ 收盘价 / 交易日数量
收盘中位数 = 排序后位于中间位置的收盘价
收盘标准差 = 样本标准差(收盘价)
年化波动率 = 样本标准差(日涨跌幅) × sqrt(242)
日均成交量 = Σ 成交量 / 交易日数量
年化低位位置 = (最新收盘价 - 年度最低价) / (年度最高价 - 年度最低价) × 100%
```

年化波动率是探索性指标，不是对后续收益的预测。

## 4. 技术选型

| 层级 | 技术 | 选择理由 |
| --- | --- | --- |
| 页面框架 | Vue 3.5.22 global build | 无需构建即可运行静态页面 |
| 移动端控件 | TDesign Mobile Vue 1.16.2 | 提供 Navbar、Segmented、Cell、Tag、Progress、Button、Icon 等一致控件 |
| 图表 | Chart.js 4.4.7 | 支持响应式折线图、柱状图、Tooltip 和无障碍描述 |
| 数据构建 | Python + openpyxl | 能精确读取工作簿并执行严格校验 |
| 自动化测试 | Playwright | 支持移动端视口、控件交互和运行时错误检测 |
| 设计流程 | UI UX Pro Max | 生成金融分析设计系统、配色、字体、图表与交付前检查规则 |

所有浏览器依赖均存放在 `vendor/`，页面不依赖运行时网络请求。

## 5. UI/UX 设计过程

先使用 UI UX Pro Max 生成并持久化设计系统：

```text
design-system/byd-stock-analytics/MASTER.md
design-system/byd-stock-analytics/pages/dashboard.md
```

设计结论：

- 风格：Minimalism & Swiss Style，强调稳定网格、留白和清晰层级。
- 配色：蓝色主数据色、琥珀色重点色、红色与青色表达涨跌，并提供文字标签。
- 字体：数字和代码使用 Fira Code 风格，正文使用 Fira Sans 与中文无衬线回退。
- 动效：仅保留约 200 至 300ms 的图表更新和状态反馈，并支持减少动效。
- 交互：观察区间和图表指标均可切换，最近行情可展开，避免静态长表。
- 无障碍：图表提供 `aria-label`，按钮有可读文字，焦点状态可见，颜色不是唯一语义。

页面采用 430px 最大移动内容宽度；375px 下自动收紧边距，不产生横向滚动。

## 6. TDesign MCP 使用过程

项目使用官方 `tdesign-mcp-server 0.2.4`，通过 MCP 查询：

- 组件列表：`mobile-vue`
- 组件文档：Navbar、Cell、Segmented、Tabs、Tag、Button、Progress、Table、Grid、Icon
- 图标检索：`chart-line-data`、`arrow-up`、`arrow-down`、`data`

最终页面使用 Navbar、Icon、Tag、Segmented、Progress、CellGroup、Cell 和
Button。组件属性和插槽均以 MCP 返回的官方文档为准。

完整查询说明见 `docs/TDESIGN_MCP.md`。

## 7. 页面功能

1. 顶部展示最新收盘价、日涨跌幅和年度收益率。
2. 使用 TDesign Segmented 选择近 1 月、3 月、6 月和全年。
3. 图表可在价格趋势与成交量之间切换。
4. 统计卡片随观察区间重新计算均值、最高、最低和日均成交量。
5. TDesign Progress 展示收盘价年度位置和上涨日占比。
6. TDesign Cell 列表展示最近 6 或 20 个交易日。
7. 数据质量区展示记录数、字段完整性、重复日期和缺失值检查。

## 8. Playwright 测试

测试文件：

```text
tests/dashboard.spec.js
```

覆盖内容：

- 页面标题、最新收盘价、年度交易日和指标卡正常渲染。
- TDesign Segmented、Progress 等控件正常挂载。
- 切换“近 1 月”后，图表可见记录数变为 20。
- 切换“成交量”后，图表模式和可访问标签同步变化。
- 展开最近行情后，记录数从 6 变为 20。
- 页面运行时无 JavaScript 异常。

运行命令：

```powershell
npm install
npx playwright install chromium
npm test
```

## 9. 截图建议

按用户要求，本次不代做网页截图。建议在浏览器开发者工具中使用
`390 × 844` 视口，分别截取：

1. 页面顶部与价格趋势图。
2. 区间统计和年度位置。
3. 成交量视图与最近行情。

页面在 `file://` 和 GitHub Pages 两种方式下均可直接加载。

## 10. Git 管理

原有分红分析保存在 `legacy/dividend-dashboard/`，本次页面位于仓库根目录，
因此历史成果和当前 issue 交付互不覆盖。

建议提交信息：

```text
feat: build BYD mobile stock analytics dashboard
docs: add sanitized agent interaction log
test: cover range filters and chart modes
```

## 11. Agent 与大模型信息

- Agent 软件：Codex Desktop
- 大模型：`deepseek-v4-flash`
- 设计辅助 Skill：`ui-ux-pro-max`
- 控件知识工具：TDesign MCP Server `0.2.4`
- 自动化浏览器：Playwright + Chromium

完整脱敏交互过程见 `docs/AGENT_INTERACTION_LOG.md`。
