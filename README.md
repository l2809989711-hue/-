# 比亚迪后复权历史行情移动端数据看板

本项目读取 `data/source/比亚迪后复权历史行情数据.xlsx`，生成可直接打开的
移动端静态数据看板。页面使用 Vue 3、TDesign Mobile Vue、Chart.js 和原生
HTML/CSS/JavaScript，不依赖后端，也不在运行时请求外部 API。

## 在线查看

打开仓库根目录的 `index.html`，或在 GitHub Pages 部署后访问根路径。原有
“新浪财经历史分红数据分析”已完整归档到
[`legacy/dividend-dashboard/`](legacy/dividend-dashboard/)。

## 页面内容

- 年度摘要：最新收盘价、年度涨跌幅、交易日数量和区间高低点。
- 可筛选趋势：支持近 1 月、3 月、6 月和 2023 全年。
- 多视图图表：可切换价格趋势与成交量视图。
- 统计指标：均值、中位数、波动率、成交额和涨跌日分布。
- 数据明细：按日期排序展示最近交易日，并提供完整数据表格语义标签。
- 数据质量：字段完整性、日期唯一性和记录数量校验。

## 数据口径

- 数据源：`data/source/比亚迪后复权历史行情数据.xlsx`
- 股票：比亚迪 `002594`，深交所，后复权价格
- 区间：2023-01-03 至 2023-12-29
- 有效记录：242 个交易日
- 价格单位：元；成交量单位：手；成交额单位：元
- 年化波动率：日涨跌幅样本标准差 × `sqrt(242)`，用于探索性比较

所有统计结果由 `scripts/build_data.py` 从工作簿重新计算，禁止手工修改
`data/byd_2023.js`。

## 本地运行

可直接打开 `index.html`，也可启动静态服务：

```powershell
python -m http.server 4173
```

然后访问 `http://127.0.0.1:4173/`。

重新生成浏览器数据：

```powershell
python scripts/build_data.py
```

## 自动化测试

```powershell
npm install
npx playwright install chromium
npm test
```

## 技术选型

- UI/UX：`ui-ux-pro-max` 生成的移动端金融分析设计系统
- 控件：TDesign Mobile Vue `1.16.2`
- 图表：Chart.js `4.4.7`
- 页面框架：Vue 3 global build
- 测试：Playwright
- Agent：Codex Desktop；模型：`deepseek-v4-flash`

详细要求和实现记录见 [`AGENTS.md`](AGENTS.md)、
[`docs/EXPERIMENT.md`](docs/EXPERIMENT.md)、
[`docs/TDESIGN_MCP.md`](docs/TDESIGN_MCP.md) 和
[`docs/AGENT_INTERACTION_LOG.md`](docs/AGENT_INTERACTION_LOG.md)。
