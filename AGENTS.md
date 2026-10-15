# BYD Stock Analytics - Repository Constraints

## Background

- The source dataset is `data/source/比亚迪后复权历史行情数据.xlsx`.
- It contains BYD after-adjusted daily market data for 2023.
- The validated dataset has 11 columns and 242 trading-day rows, from
  2023-01-03 through 2023-12-29.
- The mobile dashboard is the primary deliverable for issue #1,
  "比亚迪股票数据". The earlier dividend analysis is retained under
  `legacy/dividend-dashboard/` and must not be deleted.

## Delivery Goal

- Deliver a static mobile-first HTML page that can be opened without a backend.
- Show data quality, descriptive statistics, trend/volume visualization,
  filtering, and recent records sourced from the Excel workbook.
- Keep the source workbook read-only. Generated browser data must be produced
  by `scripts/build_data.py`.
- Provide reproducible documentation, Playwright checks, and a sanitized Agent
  interaction log.

## Technical Constraints

- Use HTML, CSS, and JavaScript with Vue 3 global build.
- Use TDesign Mobile Vue 1.16.2 controls. Do not invent TDesign props or
  component names; verify APIs through the official TDesign MCP server.
- Use the design rules in `design-system/byd-stock-analytics/MASTER.md` and
  `design-system/byd-stock-analytics/pages/dashboard.md`.
- Use Chart.js 4.x for the time-series and volume charts.
- Vendor browser libraries under `vendor/` so the page works offline and on
  GitHub Pages.
- Do not call external APIs at runtime and do not expose credentials.
- Do not fabricate market values, missing dates, or inferred fundamentals.

## Data Rules

- Read the first row as the header and the remaining rows as records.
- Validate all 11 expected columns, 242 data rows, unique dates, numeric types,
  and absence of blank required values.
- Display amounts in RMB and trading volume in lots, matching the source units.
- All statistics and charts must be derived from `window.BYD_DATA`.
- If source validation fails, stop generation rather than silently continuing.

## UI/UX Constraints

- Mobile-first target widths: 375px, 768px, and desktop preview.
- Keep the mobile content column readable and prevent horizontal overflow.
- Use semantic headings, visible focus states, 44px minimum interactive
  targets, accessible chart labels, and text or symbols in addition to color.
- Respect `prefers-reduced-motion`.
- Use the UI UX Pro Max financial/analytics palette and restrained Swiss-style
  hierarchy. Avoid decorative gradients, emojis, and card-on-card nesting.
- Keep the three most important facts above the fold: latest close, annual
  return, and annual high/low context.

## Verification

- Run `python scripts/build_data.py` and verify the generated file.
- Run `npm test` for Playwright coverage of rendering, filters, chart modes,
  and key statistics.
- Check 375px and desktop layouts for clipping and horizontal scrolling.
- Keep the final Git history readable and sanitize usernames, credentials,
  local paths, tokens, and private repository details in documentation.
