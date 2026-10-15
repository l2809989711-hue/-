import { expect, test } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const pageUrl = `file://${path.join(projectRoot, "index.html").replace(/\\/g, "/")}`;

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pageUrl);
  await expect(page.locator(".t-navbar")).toBeVisible();
  await expect(page.locator(".hero")).toBeVisible();
});

test("renders BYD annual metrics and TDesign controls", async ({ page }) => {
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  await expect(
    page.getByRole("heading", { name: "比亚迪 002594", level: 1 }),
  ).toBeVisible();
  await expect(page.locator(".hero-price")).toContainText("200.40");
  await expect(page.locator(".hero-facts")).toContainText("242");
  await expect(page.locator(".metric-card")).toHaveCount(4);
  await expect(page.locator(".chart-wrap")).toHaveAttribute("data-visible-count", "242");
  await expect(page.locator(".t-segmented")).toHaveCount(2);
  await expect(page.locator(".t-progress")).toHaveCount(2);
  await expect(page.locator("#marketChart")).toHaveAttribute(
    "aria-label",
    /2023 全年比亚迪后复权/,
  );
  expect(runtimeErrors).toEqual([]);
});

test("filters the range and recalculates visible data", async ({ page }) => {
  await page.getByText("近 1 月", { exact: true }).click();

  await expect(page.locator(".chart-wrap")).toHaveAttribute("data-visible-count", "20");
  await expect(page.locator(".hero-facts")).toContainText("242");
  await expect(page.locator(".metric-card").first()).toContainText("区间收盘均值");
});

test("switches between price and volume charts", async ({ page }) => {
  await page.getByText("成交量", { exact: true }).click();

  await expect(page.locator(".chart-wrap")).toHaveAttribute("data-chart-mode", "volume");
  await expect(page.locator("#marketChart")).toHaveAttribute("aria-label", /柱状图/);
  await expect(page.locator(".chart-caption")).toContainText("红涨绿跌");
});

test("expands the recent records list", async ({ page }) => {
  await expect(page.locator(".records-section .t-cell")).toHaveCount(6);
  await page.getByRole("button", { name: "展开最近 20 个交易日" }).click();
  await expect(page.locator(".records-section .t-cell")).toHaveCount(20);
  await expect(page.locator(".records-section .t-cell").first()).toContainText("2023-12-29");
});
