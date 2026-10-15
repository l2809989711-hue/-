# TDesign MCP 调用记录

## 服务信息

- 官方包：`tdesign-mcp-server`
- 使用版本：`0.2.4`
- 框架：`mobile-vue`
- NPM：<https://www.npmjs.com/package/tdesign-mcp-server>
- 官方仓库：<https://cnb.cool/tencent/tdesign/tdesign-mcp-server>

标准 MCP 配置：

```json
{
  "mcpServers": {
    "tdesign-mcp-server": {
      "command": "npx",
      "args": ["-y", "tdesign-mcp-server@latest"]
    }
  }
}
```

项目通过 MCP 的 `tools/list` 发现以下工具：

```text
get-component-list
get-component-docs
get-component-dom
get-component-changelog
search-icon
```

## 已查询组件

```text
Navbar
Cell
Segmented
Tabs
Tag
Button
Progress
Table
Grid
Icon
```

重点确认的 API：

| 组件 | 使用属性 |
| --- | --- |
| Navbar | `fixed`、`title`、`left`、`right` |
| Segmented | `options`、`value`、`v-model`、`block` |
| Tag | `theme`、`variant`、`size` |
| Progress | `percentage`、`theme`、`label`、`strokeWidth`、`color` |
| CellGroup | `theme` |
| Cell | `title`、`note`、`description`、`bordered`、`right-icon` |
| Button | `block`、`theme`、`variant`、`size` |
| Icon | `name`、`size` |

## 已检索图标

```text
chart-line-data
arrow-up
arrow-down
data
chart-line
```

## 页面组件映射

- 页面头部使用 Navbar 和 Icon。
- 涨跌状态使用 Tag，并保留文字标签。
- 观察区间和图表类型使用 Segmented。
- 年度位置和上涨日分布使用 Progress。
- 最近行情与数据质量使用 CellGroup 和 Cell。
- 展开记录使用 Button。

实现中没有使用 MCP 文档未声明的组件属性。
