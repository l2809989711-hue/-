# 新浪财经历史分红数据分析展示网页

这是一个用于课程实验的静态前端项目，展示“新浪财经历史分红数据获取与预处理结果”。页面包含数据上传、数据预览表格、基础统计指标和分红趋势折线图。

## 功能

- 上传 CSV / JSON 分红数据文件
- 兼容常见英文和中文字段名
- 统计记录数量、每股分红均值、极大值、极小值
- 展示前 10 条预处理数据
- 按年份聚合并绘制每股分红均值趋势

## 文件结构

```text
dividend-dashboard/
  index.html
  styles.css
  app.js
  data/sample-dividends.csv
  tests/dashboard.spec.js
  docs/EXPERIMENT.md
  package.json
  playwright.config.js
```

## 本地预览

直接双击 `index.html` 即可打开页面。也可以用任意静态服务打开：

```bash
npx http-server .
```

## 自动化测试

首次运行前安装依赖：

```bash
npm install
npx playwright install chromium
```

运行测试：

```bash
npm test
```
