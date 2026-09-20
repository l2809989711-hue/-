const sampleRows = [
  { date: '2018-06-15', stockCode: '600519', stockName: '贵州茅台', dividendPerShare: 10.999, totalDividend: 138.17, plan: '每10股派109.99元' },
  { date: '2019-06-28', stockCode: '600519', stockName: '贵州茅台', dividendPerShare: 14.539, totalDividend: 182.64, plan: '每10股派145.39元' },
  { date: '2020-07-10', stockCode: '600519', stockName: '贵州茅台', dividendPerShare: 17.025, totalDividend: 213.87, plan: '每10股派170.25元' },
  { date: '2021-06-25', stockCode: '600519', stockName: '贵州茅台', dividendPerShare: 19.293, totalDividend: 242.36, plan: '每10股派192.93元' },
  { date: '2022-06-30', stockCode: '600519', stockName: '贵州茅台', dividendPerShare: 21.675, totalDividend: 272.28, plan: '每10股派216.75元' },
  { date: '2023-06-30', stockCode: '600519', stockName: '贵州茅台', dividendPerShare: 25.911, totalDividend: 325.49, plan: '每10股派259.11元' },
  { date: '2024-06-27', stockCode: '600519', stockName: '贵州茅台', dividendPerShare: 30.876, totalDividend: 387.87, plan: '每10股派308.76元' },
  { date: '2024-07-12', stockCode: '000858', stockName: '五粮液', dividendPerShare: 4.678, totalDividend: 181.61, plan: '每10股派46.78元' },
  { date: '2024-07-18', stockCode: '000333', stockName: '美的集团', dividendPerShare: 3, totalDividend: 210.34, plan: '每10股派30元' },
  { date: '2024-08-15', stockCode: '601318', stockName: '中国平安', dividendPerShare: 1.5, totalDividend: 273.62, plan: '每10股派15元' }
];

const els = {
  fileInput: document.getElementById('fileInput'),
  dropZone: document.getElementById('dropZone'),
  loadSampleButton: document.getElementById('loadSampleButton'),
  clearButton: document.getElementById('clearButton'),
  message: document.getElementById('message'),
  sourceStatus: document.getElementById('sourceStatus'),
  validRowsLabel: document.getElementById('validRowsLabel'),
  countMetric: document.getElementById('countMetric'),
  meanMetric: document.getElementById('meanMetric'),
  maxMetric: document.getElementById('maxMetric'),
  minMetric: document.getElementById('minMetric'),
  maxLabel: document.getElementById('maxLabel'),
  minLabel: document.getElementById('minLabel'),
  tableCaption: document.getElementById('tableCaption'),
  dataBody: document.getElementById('dataBody'),
  chart: document.getElementById('trendChart'),
  emptyChart: document.getElementById('emptyChart')
};

let rows = [...sampleRows];

function formatCurrency(value) {
  if (!Number.isFinite(value)) return '-';
  return `¥${value.toFixed(2)}`;
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return '-';
  return value.toFixed(2);
}

function normalizeKey(key) {
  return String(key).trim().toLowerCase().replace(/\s+/g, '_');
}

function getValue(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== '') return row[key];
  }
  return '';
}

function toNumber(value) {
  if (typeof value === 'number') return value;
  const cleaned = String(value ?? '').replace(/[^\d.-]/g, '');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function normalizeRow(raw) {
  const normalized = {};
  Object.entries(raw).forEach(([key, value]) => {
    normalized[normalizeKey(key)] = typeof value === 'string' ? value.trim() : value;
  });

  const date = getValue(normalized, ['date', 'dividend_date', 'record_date', 'ex_date', '公告日期', '登记日期', '除权除息日']);
  const stockCode = String(getValue(normalized, ['stock_code', 'code', 'symbol', '证券代码', '股票代码', '代码'])).padStart(6, '0');
  const stockName = getValue(normalized, ['stock_name', 'name', '证券简称', '股票名称', '简称', '名称']);
  const dividendPerShare = toNumber(getValue(normalized, ['dividend_per_share', 'cash_dividend', 'bonus', '每股分红', '每股派息', '分红金额', '派息']));
  const totalDividend = toNumber(getValue(normalized, ['total_dividend', 'total_cash', '总分红', '现金分红总额', '分红总额']));
  const plan = getValue(normalized, ['plan', '方案', '分红方案', '实施方案', 'remarks']);

  return {
    date,
    stockCode,
    stockName: stockName || '-',
    dividendPerShare,
    totalDividend,
    plan: plan || '-'
  };
}

function parseCSV(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const parseLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      const next = line[i + 1];
      if (char === '"' && next === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseLine(line);
    return headers.reduce((record, header, index) => {
      record[header] = values[index] ?? '';
      return record;
    }, {});
  });
}

function parseFileContent(text, fileName) {
  if (fileName.toLowerCase().endsWith('.json')) {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : parsed.data || parsed.rows || [];
  }
  return parseCSV(text);
}

function validateRows(incomingRows) {
  return incomingRows
    .map(normalizeRow)
    .filter((row) => row.date && row.stockCode && Number.isFinite(row.dividendPerShare));
}

function computeStats(data) {
  if (!data.length) {
    return { count: 0, mean: NaN, max: null, min: null };
  }

  const total = data.reduce((sum, row) => sum + row.dividendPerShare, 0);
  const max = data.reduce((a, b) => (b.dividendPerShare > a.dividendPerShare ? b : a), data[0]);
  const min = data.reduce((a, b) => (b.dividendPerShare < a.dividendPerShare ? b : a), data[0]);
  return {
    count: data.length,
    mean: total / data.length,
    max,
    min
  };
}

function aggregateTrend(data) {
  const grouped = new Map();
  data.forEach((row) => {
    const year = new Date(row.date).getFullYear();
    if (!Number.isFinite(year)) return;
    const item = grouped.get(year) || { year, sum: 0, count: 0 };
    item.sum += row.dividendPerShare;
    item.count += 1;
    grouped.set(year, item);
  });

  return Array.from(grouped.values())
    .map((item) => ({ year: item.year, value: item.sum / item.count }))
    .sort((a, b) => a.year - b.year);
}

function renderStats() {
  const stats = computeStats(rows);
  els.countMetric.textContent = String(stats.count);
  els.meanMetric.textContent = formatCurrency(stats.mean);
  els.validRowsLabel.textContent = `${stats.count} 条有效记录`;

  if (stats.max && stats.min) {
    els.maxMetric.textContent = formatCurrency(stats.max.dividendPerShare);
    els.minMetric.textContent = formatCurrency(stats.min.dividendPerShare);
    els.maxLabel.textContent = `${new Date(stats.max.date).getFullYear()} ${stats.max.stockName}`;
    els.minLabel.textContent = `${new Date(stats.min.date).getFullYear()} ${stats.min.stockName}`;
  } else {
    els.maxMetric.textContent = '-';
    els.minMetric.textContent = '-';
    els.maxLabel.textContent = '暂无数据';
    els.minLabel.textContent = '暂无数据';
  }
}

function renderTable() {
  const previewRows = rows.slice(0, 10);
  els.tableCaption.textContent = rows.length ? `前 ${previewRows.length} 条记录` : '暂无记录';
  els.dataBody.innerHTML = '';

  if (!previewRows.length) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td class="empty-row" colspan="6">暂无可预览数据</td>';
    els.dataBody.appendChild(tr);
    return;
  }

  previewRows.forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.date}</td>
      <td>${row.stockCode}</td>
      <td>${row.stockName}</td>
      <td>${formatNumber(row.dividendPerShare)}</td>
      <td>${Number.isFinite(row.totalDividend) ? formatNumber(row.totalDividend) : '-'}</td>
      <td>${row.plan}</td>
    `;
    els.dataBody.appendChild(tr);
  });
}

function createSvgElement(name, attributes = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function renderChart() {
  const trend = aggregateTrend(rows);
  const svg = els.chart;
  svg.innerHTML = '';

  if (trend.length < 2) {
    els.emptyChart.hidden = false;
    svg.style.display = 'none';
    return;
  }

  els.emptyChart.hidden = true;
  svg.style.display = 'block';

  const width = svg.clientWidth || 900;
  const height = svg.clientHeight || 360;
  const margin = { top: 24, right: 32, bottom: 52, left: 68 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const years = trend.map((point) => point.year);
  const values = trend.map((point) => point.value);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const maxValue = Math.max(...values);
  const yMax = maxValue * 1.18;

  const xScale = (year) => {
    if (minYear === maxYear) return margin.left + innerWidth / 2;
    return margin.left + ((year - minYear) / (maxYear - minYear)) * innerWidth;
  };
  const yScale = (value) => margin.top + innerHeight - (value / yMax) * innerHeight;

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.appendChild(createSvgElement('title', { id: 'trendChartTitle' })).textContent = '年度分红均值趋势';
  svg.appendChild(createSvgElement('desc', { id: 'trendChartDesc' })).textContent = '按年份聚合后的每股分红均值折线图';

  const yTicks = 4;
  for (let i = 0; i <= yTicks; i += 1) {
    const value = (yMax / yTicks) * i;
    const y = yScale(value);
    svg.appendChild(createSvgElement('line', {
      x1: margin.left,
      x2: width - margin.right,
      y1: y,
      y2: y,
      class: 'grid-line'
    }));
    const label = createSvgElement('text', {
      x: margin.left - 12,
      y: y + 4,
      'text-anchor': 'end',
      class: 'tick-label'
    });
    label.textContent = value.toFixed(1);
    svg.appendChild(label);
  }

  const xTickStep = width < 620 ? 2 : 1;
  trend.forEach((point, index) => {
    if (index % xTickStep !== 0 && index !== trend.length - 1) return;
    const x = xScale(point.year);
    svg.appendChild(createSvgElement('line', {
      x1: x,
      x2: x,
      y1: margin.top,
      y2: margin.top + innerHeight,
      class: 'grid-line'
    }));
    const label = createSvgElement('text', {
      x,
      y: height - 18,
      'text-anchor': 'middle',
      class: 'tick-label'
    });
    label.textContent = point.year;
    svg.appendChild(label);
  });

  const path = trend
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xScale(point.year).toFixed(1)} ${yScale(point.value).toFixed(1)}`)
    .join(' ');
  const areaPath = [
    `M ${xScale(trend[0].year).toFixed(1)} ${margin.top + innerHeight}`,
    ...trend.map((point) => `L ${xScale(point.year).toFixed(1)} ${yScale(point.value).toFixed(1)}`),
    `L ${xScale(trend[trend.length - 1].year).toFixed(1)} ${margin.top + innerHeight}`,
    'Z'
  ].join(' ');

  svg.appendChild(createSvgElement('path', { d: areaPath, class: 'chart-area' }));
  svg.appendChild(createSvgElement('path', { d: path, class: 'trend-line' }));

  trend.forEach((point) => {
    const x = xScale(point.year);
    const y = yScale(point.value);
    const group = createSvgElement('g');
    group.appendChild(createSvgElement('circle', {
      cx: x,
      cy: y,
      r: 5,
      class: 'trend-point'
    }));
    const label = createSvgElement('text', {
      x,
      y: y - 12,
      'text-anchor': 'middle',
      class: 'chart-label'
    });
    label.textContent = point.value.toFixed(2);
    group.appendChild(label);
    svg.appendChild(group);
  });

  const yTitle = createSvgElement('text', {
    x: 18,
    y: margin.top + innerHeight / 2,
    transform: `rotate(-90 18 ${margin.top + innerHeight / 2})`,
    'text-anchor': 'middle',
    class: 'axis-label'
  });
  yTitle.textContent = '每股分红均值（元）';
  svg.appendChild(yTitle);

  const xTitle = createSvgElement('text', {
    x: margin.left + innerWidth / 2,
    y: height - 2,
    'text-anchor': 'middle',
    class: 'axis-label'
  });
  xTitle.textContent = '年份';
  svg.appendChild(xTitle);
}

function render() {
  renderStats();
  renderTable();
  renderChart();
}

async function handleFile(file) {
  try {
    const text = await file.text();
    const parsedRows = parseFileContent(text, file.name);
    const validRows = validateRows(parsedRows);
    if (!validRows.length) {
      throw new Error('未识别到有效的分红字段');
    }

    rows = validRows;
    els.sourceStatus.textContent = `已载入 ${file.name}`;
    els.message.textContent = `成功解析 ${validRows.length} 条有效分红记录。`;
    render();
  } catch (error) {
    els.message.textContent = `解析失败：${error.message}`;
  }
}

els.fileInput.addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (file) handleFile(file);
});

els.dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  els.dropZone.classList.add('is-dragging');
});

els.dropZone.addEventListener('dragleave', () => {
  els.dropZone.classList.remove('is-dragging');
});

els.dropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  els.dropZone.classList.remove('is-dragging');
  const [file] = event.dataTransfer.files;
  if (file) handleFile(file);
});

els.loadSampleButton.addEventListener('click', () => {
  rows = [...sampleRows];
  els.fileInput.value = '';
  els.sourceStatus.textContent = '示例数据已加载';
  els.message.textContent = '已恢复示例分红数据。';
  render();
});

els.clearButton.addEventListener('click', () => {
  rows = [];
  els.fileInput.value = '';
  els.sourceStatus.textContent = '等待上传数据';
  els.message.textContent = '已清空数据。';
  render();
});

window.addEventListener('resize', renderChart);
render();
