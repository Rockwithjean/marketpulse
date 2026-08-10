document.addEventListener('DOMContentLoaded', () => {
  // ============================================================
  // UTILITIES
  // ============================================================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const fmt = (n, decimals = 2) => n.toLocaleString('en-KE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  // ============================================================
  // DATE / TIME
  // ============================================================
  const dateEl = $('#dashboardDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ============================================================
  // AUTH FORMS
  // ============================================================
  const loginForm = $('#loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = loginForm.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Signing in...';
      }
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 350);
    });
  }

  const signupForm = $('#signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = signupForm.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Creating account...';
      }
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 350);
    });
  }

  const settingsForm = $('#settingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = settingsForm.querySelector('button[type="submit"]');
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = 'Saved ✓';
        btn.disabled = true;
        setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1600);
      }
    });
  }

  // ============================================================
  // LANDING PAGE MOBILE SITE DRAWER
  // ============================================================
  const siteNavToggle = $('#siteNavToggle');
  const siteNavClose = $('#siteNavClose');
  const siteNavDrawer = $('#siteNavDrawer');
  const siteNavOverlay = $('#siteNavOverlay');

  function toggleSiteNav(show) {
    if (!siteNavDrawer) return;
    const open = show !== undefined ? show : !siteNavDrawer.classList.contains('open');
    siteNavDrawer.classList.toggle('open', open);
    if (siteNavOverlay) siteNavOverlay.classList.toggle('active', open);
  }

  if (siteNavToggle) {
    siteNavToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSiteNav();
    });
  }

  if (siteNavClose) {
    siteNavClose.addEventListener('click', () => toggleSiteNav(false));
  }

  if (siteNavOverlay) {
    siteNavOverlay.addEventListener('click', () => toggleSiteNav(false));
  }

  $$('.drawer-link').forEach((link) => {
    link.addEventListener('click', () => toggleSiteNav(false));
  });

  // ============================================================
  // MOBILE SIDEBAR & OVERLAY
  // ============================================================
  const mobileToggle = $('#mobileMenuToggle');
  const sidebar = $('#sidebar');
  const overlay = $('#sidebarOverlay');

  function toggleSidebar(show) {
    if (!sidebar) return;
    const open = show !== undefined ? show : !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', open);
    if (overlay) overlay.classList.toggle('active', open);
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSidebar();
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => toggleSidebar(false));
  }

  document.addEventListener('click', (e) => {
    if (sidebar && sidebar.classList.contains('open') && !sidebar.contains(e.target) && (!mobileToggle || !mobileToggle.contains(e.target))) {
      toggleSidebar(false);
    }
  });

  // ============================================================
  // TAB NAVIGATION
  // ============================================================
  $$('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      $$('.tab-button').forEach((b) => b.classList.remove('active'));
      $$('.tab-panel').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(tabName);
      if (target) target.classList.add('active');

      // Trigger window resize event to force charts to recalculate layout dimensions upon tab switch
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    });
  });

  $$('.sidebar-nav .nav-item[data-target]').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      $$('.nav-item').forEach((n) => n.classList.remove('active'));
      item.classList.add('active');
      const tabBtn = $(`.tab-button[data-tab="${item.dataset.target}"]`);
      if (tabBtn) tabBtn.click();
      if (window.innerWidth <= 980) toggleSidebar(false);
    });
  });

  // ============================================================
  // ACCOUNT SWITCHER
  // ============================================================
  const accounts = {
    demo: {
      label: 'Demo Balance',
      balance: 10000.00,
      sub: 'Practice account — no risk',
      statSub: '+8.4% this month (demo)',
      pnl: '+KSh 1,430.00',
      pnlClass: 'up-text',
    },
    real: {
      label: 'Real Balance',
      balance: 84250.00,
      sub: 'Live account — funds at risk',
      statSub: '+8.4% this month',
      pnl: '+KSh 17,430.00',
      pnlClass: 'up-text',
    },
  };

  let currentAccount = 'demo';

  function switchAccount(type) {
    currentAccount = type;
    const acc = accounts[type];

    // Sidebar
    const labelEl = $('#acctLabel');
    const balEl = $('#acctBalance');
    const subEl = $('#acctSub');
    if (labelEl) labelEl.textContent = acc.label;
    if (balEl) balEl.textContent = 'KSh ' + fmt(acc.balance);
    if (subEl) subEl.textContent = acc.sub;

    // Topbar badge
    const badge = $('#topbarAccountBadge');
    const badgeText = $('#topbarAccountType');
    if (badge) {
      badge.classList.toggle('real-account', type === 'real');
      badge.classList.toggle('demo-account', type === 'demo');
    }
    if (badgeText) badgeText.textContent = type === 'demo' ? 'Demo Account' : 'Real Account';

    // Stat cards
    const statBalance = $('#statBalance');
    const statBalanceSub = $('#statBalanceSub');
    const statPnl = $('#statPnl');
    if (statBalance) statBalance.textContent = 'KSh ' + fmt(acc.balance);
    if (statBalanceSub) statBalanceSub.textContent = acc.statSub;
    if (statPnl) {
      statPnl.textContent = acc.pnl;
      statPnl.className = acc.pnlClass;
    }

    // Toggle buttons styling
    $$('.account-toggle-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.account === type);
    });
  }

  $$('.account-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchAccount(btn.dataset.account));
  });

  switchAccount('demo'); // default

  // ============================================================
  // LIVE CHART (lightweight-charts)
  // ============================================================
  const chartContainer = $('#liveChart');
  let chart, candleSeries, priceUpdateInterval;

  function generateCandles(basePrice, count) {
    const candles = [];
    let price = basePrice;
    const now = Math.floor(Date.now() / 1000);
    for (let i = count; i >= 0; i--) {
      const open = price;
      const close = open + (Math.random() - 0.49) * basePrice * 0.003;
      const high = Math.max(open, close) + Math.random() * basePrice * 0.002;
      const low = Math.min(open, close) - Math.random() * basePrice * 0.002;
      candles.push({ time: now - i * 60, open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2) });
      price = close;
    }
    return candles;
  }

  const symbolDefaults = {
    VOL75: { base: 1200, decimals: 2 },
    VOL100: { base: 2840, decimals: 2 },
    EURUSD: { base: 1.0847, decimals: 5 },
    BOOM500: { base: 9400, decimals: 2 },
    CRASH500: { base: 8120, decimals: 2 },
  };

  let currentSymbol = 'VOL75';
  let currentCandles = [];

  function initChart() {
    if (!chartContainer || typeof LightweightCharts === 'undefined') return;

    const isDark = true;
    chart = LightweightCharts.createChart(chartContainer, {
      width: chartContainer.clientWidth,
      height: 320,
      layout: {
        background: { color: 'transparent' },
        textColor: 'rgba(200,210,220,0.8)',
        fontFamily: 'Inter, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
        vertLine: { color: 'rgba(212,164,71,0.5)', labelBackgroundColor: '#d4a447' },
        horzLine: { color: 'rgba(212,164,71,0.5)', labelBackgroundColor: '#d4a447' },
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.06)',
        scaleMargins: { top: 0.05, bottom: 0.05 },
      },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.06)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    candleSeries = chart.addCandlestickSeries({
      upColor: '#28c98d',
      downColor: '#ff5a59',
      borderUpColor: '#28c98d',
      borderDownColor: '#ff5a59',
      wickUpColor: '#28c98d',
      wickDownColor: '#ff5a59',
    });

    loadSymbol(currentSymbol);

    // Responsive resize
    const ro = new ResizeObserver(() => {
      if (chart) chart.applyOptions({ width: chartContainer.clientWidth });
    });
    ro.observe(chartContainer);
  }

  function loadSymbol(sym) {
    if (!chart || !candleSeries) return;
    const def = symbolDefaults[sym] || symbolDefaults['VOL75'];
    currentCandles = generateCandles(def.base, 80);
    candleSeries.setData(currentCandles);
    chart.timeScale().fitContent();
    updateChartInfoBar();

    clearInterval(priceUpdateInterval);
    priceUpdateInterval = setInterval(() => {
      updateLivePrice(sym);
    }, 1500);
  }

  function updateLivePrice(sym) {
    if (!candleSeries || !currentCandles.length) return;
    const def = symbolDefaults[sym] || symbolDefaults['VOL75'];
    const last = currentCandles[currentCandles.length - 1];
    const now = Math.floor(Date.now() / 1000);

    const newClose = +(last.close + (Math.random() - 0.49) * def.base * 0.0018).toFixed(def.decimals);
    const newHigh = +(Math.max(last.high, newClose)).toFixed(def.decimals);
    const newLow = +(Math.min(last.low, newClose)).toFixed(def.decimals);

    // New candle every 60s
    if (now - last.time >= 60) {
      const newCandle = {
        time: last.time + 60,
        open: last.close,
        high: newHigh,
        low: newLow,
        close: newClose,
      };
      currentCandles.push(newCandle);
      candleSeries.update(newCandle);
    } else {
      const updated = { ...last, close: newClose, high: newHigh, low: newLow };
      currentCandles[currentCandles.length - 1] = updated;
      candleSeries.update(updated);
    }

    updateChartInfoBar();
  }

  function updateChartInfoBar() {
    if (!currentCandles.length) return;
    const last = currentCandles[currentCandles.length - 1];
    const first = currentCandles[0];
    const change = last.close - last.open;
    const changePct = ((change / last.open) * 100);

    const priceEl = $('#chartCurrentPrice');
    const changeEl = $('#chartPriceChange');
    if (priceEl) priceEl.textContent = fmt(last.close);
    if (changeEl) {
      const arrow = change >= 0 ? '▲' : '▼';
      changeEl.textContent = `${arrow} ${change >= 0 ? '+' : ''}${fmt(Math.abs(change))} (${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%)`;
      changeEl.className = 'chart-change ' + (change >= 0 ? 'up' : 'down');
    }
    const openEl = $('#chartOpen'); if (openEl) openEl.textContent = fmt(last.open);
    const highEl = $('#chartHigh'); if (highEl) highEl.textContent = fmt(last.high);
    const lowEl = $('#chartLow'); if (lowEl) lowEl.textContent = fmt(last.low);
    const closeEl = $('#chartClose'); if (closeEl) closeEl.textContent = fmt(last.close);
  }

  // Symbol selector
  const symbolSelect = $('#chartSymbol');
  if (symbolSelect) {
    symbolSelect.addEventListener('change', () => {
      currentSymbol = symbolSelect.value;
      loadSymbol(currentSymbol);
    });
  }

  // Timeframe buttons
  $$('.tf-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const strip = btn.closest('.chart-timeframe-group, .perf-period-group');
      if (strip) strip.querySelectorAll('.tf-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      if (chart) {
        const def = symbolDefaults[currentSymbol] || symbolDefaults['VOL75'];
        currentCandles = generateCandles(def.base, 80);
        candleSeries.setData(currentCandles);
        chart.timeScale().fitContent();
      }
    });
  });

  // ============================================================
  // PERFORMANCE CHART
  // ============================================================
  function initPerfChart() {
    const perfContainer = $('#perfChart');
    if (!perfContainer || typeof LightweightCharts === 'undefined') return;

    const perfChart = LightweightCharts.createChart(perfContainer, {
      width: perfContainer.clientWidth,
      height: 240,
      layout: { background: { color: 'transparent' }, textColor: 'rgba(200,210,220,0.7)', fontFamily: 'Inter', fontSize: 11 },
      grid: { vertLines: { color: 'rgba(255,255,255,0.04)' }, horzLines: { color: 'rgba(255,255,255,0.04)' } },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.06)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.06)', timeVisible: true },
      crosshair: { vertLine: { labelBackgroundColor: '#d4a447' }, horzLine: { labelBackgroundColor: '#d4a447' } },
    });

    const lineSeries = perfChart.addAreaSeries({
      lineColor: '#d4a447',
      topColor: 'rgba(212,164,71,0.22)',
      bottomColor: 'rgba(212,164,71,0.01)',
      lineWidth: 2,
    });

    const now = Math.floor(Date.now() / 1000);
    const perfData = [];
    let equity = 75000;
    for (let i = 29; i >= 0; i--) {
      equity += (Math.random() - 0.38) * 2000;
      perfData.push({ time: now - i * 86400, value: +equity.toFixed(2) });
    }
    lineSeries.setData(perfData);
    perfChart.timeScale().fitContent();

    const ro = new ResizeObserver(() => { perfChart.applyOptions({ width: perfContainer.clientWidth }); });
    ro.observe(perfContainer);
  }

  // ============================================================
  // LIVE MARKET TICKERS
  // ============================================================
  const tickerData = {
    vol75: { el: '#vol75Price', changeEl: '#vol75Change', base: 1204.83, dir: 1 },
    eurusd: { el: '#eurusdPrice', changeEl: '#eurusdChange', base: 1.0847, dir: -1 },
    boom500: { el: '#boom500Price', changeEl: '#boom500Change', base: 9412.50, dir: 1 },
  };

  function updateTicker(key) {
    const t = tickerData[key];
    const isSmall = t.base < 10;
    const delta = (Math.random() - 0.49) * (isSmall ? 0.0002 : t.base * 0.0006);
    t.base = +(t.base + delta).toFixed(isSmall ? 5 : 2);
    const pct = ((delta / t.base) * 100);
    const priceEl = document.querySelector(t.el);
    const changeEl = document.querySelector(t.changeEl);
    if (priceEl) priceEl.textContent = isSmall ? t.base.toFixed(5) : fmt(t.base);
    if (changeEl) {
      changeEl.textContent = (delta >= 0 ? '+' : '') + pct.toFixed(2) + '%';
      changeEl.className = 'ticker-change ' + (delta >= 0 ? 'up' : 'down');
    }

    // Also update markets table
    const mktPriceEl = document.querySelector(
      key === 'vol75' ? '#mktVol75' : key === 'eurusd' ? '#mktEurUsd' : '#mktBoom500'
    );
    const mktChgEl = document.querySelector(
      key === 'vol75' ? '#mktVol75Chg' : key === 'eurusd' ? '#mktEurUsdChg' : '#mktBoom500Chg'
    );
    if (mktPriceEl) mktPriceEl.textContent = isSmall ? t.base.toFixed(5) : fmt(t.base);
    if (mktChgEl) {
      mktChgEl.textContent = (delta >= 0 ? '+' : '') + pct.toFixed(2) + '%';
      mktChgEl.className = 'market-change ' + (delta >= 0 ? 'up' : 'down');
    }
  }

  setInterval(() => { Object.keys(tickerData).forEach(updateTicker); }, 2000);

  // ============================================================
  // POSITION TIMERS
  // ============================================================
  let pos1Sec = 22, pos2Sec = 221;
  function updatePositions() {
    const p1 = $('#pos1Timer'), p2 = $('#pos2Timer');
    const p1pnl = $('#pos1Pnl'), p2pnl = $('#pos2Pnl');
    if (pos1Sec > 0) {
      pos1Sec--;
      if (p1) p1.textContent = pos1Sec + 's';
      const pnl = +(34 + (Math.random() - 0.5) * 5).toFixed(2);
      if (p1pnl) { p1pnl.textContent = '+KSh ' + fmt(pnl); p1pnl.className = 'position-pnl up-text'; }
    } else {
      if (p1) p1.textContent = 'Closed';
    }
    if (pos2Sec > 0) {
      pos2Sec--;
      const m = Math.floor(pos2Sec / 60), s = pos2Sec % 60;
      if (p2) p2.textContent = m + 'm ' + s + 's';
      const pnl = +(-12 + (Math.random() - 0.4) * 8).toFixed(2);
      if (p2pnl) {
        p2pnl.textContent = (pnl >= 0 ? '+' : '') + 'KSh ' + fmt(Math.abs(pnl));
        p2pnl.className = 'position-pnl ' + (pnl >= 0 ? 'up-text' : 'down-text');
      }
    }
  }
  setInterval(updatePositions, 1000);

  // ============================================================
  // SIDEBAR SYNC TIMER
  // ============================================================
  let syncSec = 0;
  setInterval(() => {
    syncSec++;
    const el = $('#lastSync');
    if (!el) return;
    if (syncSec < 60) el.textContent = syncSec + 's ago';
    else if (syncSec < 3600) el.textContent = Math.floor(syncSec / 60) + ' min ago';
    else { el.textContent = 'just now'; syncSec = 0; }
  }, 1000);

  // ============================================================
  // EXPORT UTILITY
  // ============================================================
  window.exportReport = function () {
    const data = [
      ['Asset', 'Type', 'Stake', 'Result', 'Time'],
      ['Vol 75', 'CALL', 'KSh 200', '+KSh 184', '14:32'],
      ['EUR/USD', 'PUT', 'KSh 500', '-KSh 500', '14:18'],
      ['Boom 500', 'CALL', 'KSh 300', '+KSh 276', '13:55'],
      ['Vol 100', 'PUT', 'KSh 150', '+KSh 138', '13:41'],
      ['Crash 500', 'CALL', 'KSh 400', '-KSh 400', '13:20'],
    ];
    const csv = data.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'marketpulse-report.csv';
    a.click();
  };

  // ============================================================
  // INIT
  // ============================================================
  initChart();
  initPerfChart();
});
