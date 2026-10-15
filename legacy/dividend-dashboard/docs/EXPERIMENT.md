# 实验文档：新浪财经历史分红数据分析展示网页

## 1. 实验目标

本实验完成一个“数据分析展示网页”，用于展示新浪财经历史分红数据获取与预处理后的结果。页面重点覆盖数据上传、数据预览、基础统计指标和分红趋势可视化，服务于金融数据获取及预处理课程作业。

## 2. 项目任务拆解

1. 数据输入层：提供 CSV / JSON 文件上传入口，并保留示例分红数据用于快速演示。
2. 数据预处理层：统一字段名，兼容 `date`、`stock_code`、`stock_name`、`dividend_per_share` 等英文表头，以及“股票代码”“股票名称”“每股分红”“总分红”等中文表头。
3. 统计分析层：计算有效记录数量、每股分红均值、极大值和极小值。
4. 可视化层：按年份聚合每股分红均值，绘制简单折线趋势图。
5. 测试验证层：使用 Playwright 测试页面初始渲染、文件上传解析、统计结果和空状态。
6. 项目管理层：补充 README、实验文档和 Git 管理说明，保证提交材料结构完整。

## 3. 前端实现说明

项目采用原生 HTML、CSS、JavaScript 实现，不依赖后端服务。

- `index.html`：页面结构，包括上传区、统计卡片、图表区和表格区。
- `styles.css`：浅色、简洁、学术风格样式。
- `app.js`：完成文件解析、字段标准化、统计计算、表格渲染和 SVG 折线图绘制。
- `data/sample-dividends.csv`：实验示例数据。

数据格式建议：

```csv
date,stock_code,stock_name,dividend_per_share,total_dividend,plan
2024-06-27,600519,贵州茅台,30.8760,387.87,每10股派308.76元
```

## 4. Playwright 网页测试

测试文件位于 `tests/dashboard.spec.js`，覆盖：

- 首页标题、指标卡、表格和图表是否正常展示。
- 上传 `data/sample-dividends.csv` 后是否重新计算统计指标。
- 点击“清空”后是否展示空表格和空图表状态。

运行步骤：

```bash
npm install
npx playwright install chromium
npm test
```

## 5. 火山方舟 API 接入说明

本项目当前前端页面为本地数据展示，不直接调用大模型 API。若后续需要接入火山方舟，用于生成数据解读、自动撰写分析结论或辅助代码解释，可按下面流程接入。

参考官方资料：

- 火山方舟产品页提供“获取 API KEY”和“进入火山方舟”入口，并说明火山方舟是一站式大模型服务平台：https://www.volcengine.com/
- 火山方舟快速入门文档说明需要先获取并配置 API Key，再开通模型服务：https://www.volcengine.com/docs/82379/1399008
- 火山方舟 OpenAI SDK 兼容说明：https://www.volcengine.com/docs/82379/1330626
- 火山方舟 Base URL 及鉴权说明：https://www.volcengine.com/docs/82379/1298459
- 火山方舟 Chat API 说明：https://www.volcengine.com/docs/82379/1112500

### 5.1 获取 API Key

1. 登录火山引擎控制台。
2. 进入火山方舟。
3. 在控制台左下角选择 API Key 管理。
4. 创建 API Key，并复制保存。
5. 不要把真实 API Key 写入前端代码、Git 仓库或公开文档。

### 5.2 开通模型服务

1. 进入火山方舟“开通管理”或模型服务页面。
2. 选择需要使用的模型，例如豆包系列模型或课程要求指定模型。
3. 确认计费、配额和服务状态。
4. 记录模型 ID 或推理接入点 ID，实际名称以控制台显示为准。

### 5.3 Python 接入示例

建议使用环境变量保存 Token：

```powershell
$env:ARK_API_KEY="你的火山方舟 API Key"
```

Python 示例：

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["ARK_API_KEY"],
    base_url="https://ark.cn-beijing.volces.com/api/v3",
)

response = client.chat.completions.create(
    model="你的模型或推理接入点 ID",
    messages=[
        {"role": "system", "content": "你是金融数据分析助手。"},
        {"role": "user", "content": "请解释上市公司分红均值趋势。"},
    ],
)

print(response.choices[0].message.content)
```

### 5.4 Token 使用步骤与注意事项

1. 创建 API Key 后仅在本机环境变量或后端密钥管理系统中保存。
2. 调用 API 时通过 `Authorization` 或 SDK 的 `api_key` 参数传入。
3. 统计 Token 使用量时，关注控制台账单、模型调用日志或响应中的 usage 字段。
4. 开发阶段设置较小的输入数据和较短输出长度，避免不必要消耗。
5. 若 Key 泄露，立即在控制台禁用或删除旧 Key，并重新创建。
6. 前端页面如需调用模型，必须通过后端代理，不能在浏览器暴露 Token。

## 6. Git 项目管理说明

建议从 `dividend-dashboard` 目录初始化 Git：

```bash
git init
git add .
git commit -m "init dividend dashboard experiment"
```

常用分支策略：

```bash
git checkout -b feature/dashboard-ui
git add index.html styles.css app.js
git commit -m "feat: build dividend dashboard ui"

git checkout -b test/playwright
git add tests playwright.config.js package.json
git commit -m "test: add playwright dashboard tests"
```

提交前检查：

```bash
git status
npm test
```

建议 `.gitignore` 内容：

```gitignore
node_modules/
playwright-report/
test-results/
.env
```

## 7. 实验总结

本项目完成了从分红数据上传、字段统一、统计指标计算到趋势图展示的前端闭环，并通过 Playwright 自动化测试验证核心交互。后续可以扩展为从新浪财经接口或已爬取文件自动导入数据，并接入火山方舟生成自然语言分析报告。
