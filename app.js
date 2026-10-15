const { computed, createApp, nextTick, onMounted, ref, watch } = Vue;

const DATA = window.BYD_DATA;

if (!DATA || !Array.isArray(DATA.rows) || DATA.rows.length === 0) {
  throw new Error("BYD_DATA is missing. Run scripts/build_data.py first.");
}

const rangeOptions = [
  { value: "1m", label: "近 1 月" },
  { value: "3m", label: "近 3 月" },
  { value: "6m", label: "近 6 月" },
  { value: "1y", label: "2023 全年" },
];

const chartModeOptions = [
  { value: "price", label: "价格趋势" },
  { value: "volume", label: "成交量" },
];

const rangeLengths = {
  "1m": 20,
  "3m": 60,
  "6m": 120,
  "1y": DATA.rows.length,
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

createApp({
  setup() {
    const rangeKey = ref("1y");
    const chartMode = ref("price");
    const showAllRows = ref(false);
    const chartCanvas = ref(null);
    let chartInstance = null;

    const meta = DATA.meta;
    const stats = DATA.stats;
    const rows = DATA.rows;
    const lastRow = rows.at(-1);

    const visibleRows = computed(() => rows.slice(-rangeLengths[rangeKey.value]));
    const displayedRows = computed(() => {
      const count = showAllRows.value ? 20 : 6;
      return rows.slice(-count).reverse();
    });

    const rangeLabel = computed(
      () => rangeOptions.find((option) => option.value === rangeKey.value)?.label ?? "",
    );

    const rangeStats = computed(() => {
      const selected = visibleRows.value;
      const closes = selected.map((row) => row.close);
      const highs = selected.map((row) => row.high);
      const lows = selected.map((row) => row.low);
      const volumes = selected.map((row) => row.volume);
      const amplitudes = selected.map((row) => row.amplitudePct);
      const mean = closes.reduce((total, value) => total + value, 0) / closes.length;
      return {
        closeMean: mean,
        highMax: Math.max(...highs),
        lowMin: Math.min(...lows),
        volumeMean: volumes.reduce((total, value) => total + value, 0) / volumes.length,
        amplitudeMeanPct:
          amplitudes.reduce((total, value) => total + value, 0) / amplitudes.length,
      };
    });

    const rangeMetrics = computed(() => [
      {
        label: "区间收盘均值",
        value: `¥${formatPrice(rangeStats.value.closeMean)}`,
        note: `${visibleRows.value.length} 个交易日算术平均`,
        icon: "chart-line-data",
      },
      {
        label: "区间最高",
        value: `¥${formatPrice(rangeStats.value.highMax)}`,
        note: "区间内最高价极值",
        icon: "arrow-up",
      },
      {
        label: "区间最低",
        value: `¥${formatPrice(rangeStats.value.lowMin)}`,
        note: "区间内最低价极值",
        icon: "arrow-down",
      },
      {
        label: "日均成交量",
        value: formatVolume(rangeStats.value.volumeMean),
        note: "单位：手",
        icon: "data",
      },
    ]);

    const positionPct = computed(() => {
      const span = stats.highMax - stats.lowMin;
      if (span <= 0) return 0;
      return clamp(((stats.lastClose - stats.lowMin) / span) * 100, 0, 100);
    });

    const upDayRatio = computed(() => {
      const directionalDays = stats.upDays + stats.downDays;
      return directionalDays === 0 ? 0 : (stats.upDays / directionalDays) * 100;
    });

    const chartCaption = computed(() => {
      if (chartMode.value === "volume") {
        return `${rangeLabel.value}成交量 · 红涨绿跌`;
      }
      const change = visibleRows.value.at(-1).close - visibleRows.value[0].close;
      const changePct = (change / visibleRows.value[0].close) * 100;
      return `${rangeLabel.value}收盘变化 ${signed(change)} / ${signed(changePct)}%`;
    });

    const chartAriaLabel = computed(() =>
      chartMode.value === "price"
        ? `${rangeLabel.value}比亚迪后复权最高价、最低价与收盘价折线图`
        : `${rangeLabel.value}比亚迪成交量柱状图，红色表示上涨日，青色表示下跌日`,
    );

    function initChart() {
      if (!window.Chart || !chartCanvas.value) return;
      const context = chartCanvas.value.getContext("2d");
      chartInstance = new Chart(context, {
        type: "line",
        data: buildChartData(),
        options: buildChartOptions(),
      });
    }

    function buildChartData() {
      const selected = visibleRows.value;
      const labels = selected.map((row) => row.date.slice(5));

      if (chartMode.value === "volume") {
        return {
          labels,
          datasets: [
            {
              label: "成交量（手）",
              data: selected.map((row) => row.volume),
              backgroundColor: selected.map((row) =>
                row.changePct >= 0 ? "rgba(200, 30, 30, 0.72)" : "rgba(15, 118, 110, 0.72)",
              ),
              borderWidth: 0,
              borderRadius: 2,
              maxBarThickness: 8,
            },
          ],
        };
      }

      return {
        labels,
        datasets: [
          {
            label: "收盘",
            data: selected.map((row) => row.close),
            borderColor: "#1E40AF",
            backgroundColor: "rgba(59, 130, 246, 0.10)",
            borderWidth: 2.5,
            pointRadius: 0,
            pointHitRadius: 14,
            pointHoverRadius: 4,
            tension: 0.22,
            fill: true,
          },
          {
            label: "最高",
            data: selected.map((row) => row.high),
            borderColor: "#D97706",
            borderWidth: 1.2,
            borderDash: [4, 4],
            pointRadius: 0,
            pointHitRadius: 10,
            tension: 0.18,
          },
          {
            label: "最低",
            data: selected.map((row) => row.low),
            borderColor: "#0F766E",
            borderWidth: 1.2,
            borderDash: [2, 4],
            pointRadius: 0,
            pointHitRadius: 10,
            tension: 0.18,
          },
        ],
      };
    }

    function buildChartOptions() {
      const priceMode = chartMode.value === "price";
      return {
        responsive: true,
        maintainAspectRatio: false,
        animation: prefersReducedMotion ? false : { duration: 260 },
        interaction: {
          intersect: false,
          mode: "index",
        },
        layout: {
          padding: { top: 8, right: 4, bottom: 0, left: 0 },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            displayColors: true,
            backgroundColor: "#17305f",
            titleFont: { family: '"Fira Sans", sans-serif', size: 12, weight: "600" },
            bodyFont: { family: '"Fira Code", monospace', size: 11 },
            padding: 10,
            callbacks: {
              title(items) {
                const index = items[0]?.dataIndex ?? 0;
                return visibleRows.value[index]?.date ?? "";
              },
              label(context) {
                const value = context.parsed.y;
                return priceMode
                  ? `${context.dataset.label}: ¥${formatPrice(value)}`
                  : `成交量: ${formatVolume(value)}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: "#64748B",
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 5,
              font: { family: '"Fira Code", monospace', size: 9 },
            },
          },
          y: {
            beginAtZero: !priceMode,
            grid: {
              color: "rgba(148, 163, 184, 0.18)",
              drawTicks: false,
            },
            border: { display: false },
            ticks: {
              color: "#64748B",
              maxTicksLimit: 5,
              padding: 6,
              font: { family: '"Fira Code", monospace', size: 9 },
              callback(value) {
                return priceMode ? `¥${value}` : compactNumber(value);
              },
            },
          },
        },
      };
    }

    function refreshChart() {
      if (!chartInstance) return;
      chartInstance.data = buildChartData();
      chartInstance.options = buildChartOptions();
      chartInstance.update();
    }

    watch([rangeKey, chartMode], async () => {
      await nextTick();
      refreshChart();
    });

    onMounted(async () => {
      await nextTick();
      initChart();
    });

    return {
      meta,
      stats,
      lastRow,
      rangeKey,
      rangeOptions,
      chartMode,
      chartModeOptions,
      visibleRows,
      displayedRows,
      showAllRows,
      rangeLabel,
      rangeStats,
      rangeMetrics,
      positionPct,
      upDayRatio,
      chartCaption,
      chartAriaLabel,
      chartCanvas,
      formatPrice,
      formatVolume,
      formatPercent,
      signed,
    };
  },
})
  .use(TDesign)
  .mount("#app");

function formatPrice(value) {
  return Number(value).toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatVolume(value) {
  return `${Math.round(Number(value)).toLocaleString("zh-CN")}`;
}

function formatPercent(value) {
  return `${Number(value).toFixed(2)}%`;
}

function signed(value) {
  const number = Number(value);
  return `${number >= 0 ? "+" : ""}${number.toFixed(2)}`;
}

function compactNumber(value) {
  const number = Number(value);
  if (Math.abs(number) >= 10000) {
    return `${(number / 10000).toFixed(1)}万`;
  }
  return number.toLocaleString("zh-CN");
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}
