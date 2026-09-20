import { expect, test } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const pageUrl = `file://${path.join(projectRoot, 'index.html').replace(/\\/g, '/')}`;

test('renders dashboard with sample data, metrics, table, and chart', async ({ page }) => {
  await page.goto(pageUrl);

  await expect(page.getByRole('heading', { name: '新浪财经历史分红数据分析首页' })).toBeVisible();
  await expect(page.locator('#countMetric')).toHaveText('10');
  await expect(page.locator('#meanMetric')).toHaveText('¥14.95');
  await expect(page.locator('#dataBody tr')).toHaveCount(10);
  await expect(page.locator('#trendChart .trend-point')).toHaveCount(7);
});

test('uploads csv file and recalculates statistics', async ({ page }) => {
  await page.goto(pageUrl);

  await page.setInputFiles('#fileInput', path.join(projectRoot, 'data', 'sample-dividends.csv'));

  await expect(page.locator('#message')).toContainText('成功解析 10 条有效分红记录');
  await expect(page.locator('#countMetric')).toHaveText('10');
  await expect(page.locator('#maxMetric')).toHaveText('¥30.88');
  await expect(page.getByRole('cell', { name: '贵州茅台' }).first()).toBeVisible();
});

test('clears data and shows empty states', async ({ page }) => {
  await page.goto(pageUrl);

  await page.getByRole('button', { name: '清空' }).click();

  await expect(page.locator('#countMetric')).toHaveText('0');
  await expect(page.locator('#dataBody')).toContainText('暂无可预览数据');
  await expect(page.locator('#emptyChart')).toBeVisible();
});
