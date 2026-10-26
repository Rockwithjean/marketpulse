document.addEventListener('DOMContentLoaded', () => {
  // ============================================================
  // UTILITIES
  // ============================================================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const fmt = (n, decimals = 2) => n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

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
  const accountStorageKey = (idValue) => `marketpulseAccount:${idValue.trim().toLowerCase()}`;

  function readAccountProfile(idValue) {
    const savedProfile = localStorage.getItem(accountStorageKey(idValue));
    return savedProfile ? JSON.parse(savedProfile) : null;
  }

  function saveAccountProfile(profile) {
    localStorage.setItem(accountStorageKey(profile.idNumber), JSON.stringify(profile));
    localStorage.setItem('marketpulseUserProfile', JSON.stringify(profile));
    localStorage.setItem('marketpulseUserId', profile.idNumber);
    localStorage.setItem('marketpulseUserEmail', profile.email);
    localStorage.setItem('marketpulseKycVerified', 'false');
  }

  const loginForm = $('#loginForm');
  const loginIdInput = $('#loginIdInput');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const idValue = loginIdInput ? loginIdInput.value.trim() : '';
      const emailInput = $('#loginEmail');
      const emailValue = emailInput ? emailInput.value.trim() : '';
      if (!idValue) {
        alert('Please enter your ID number before signing in.');
        if (loginIdInput) loginIdInput.focus();
        return;
      }

      try {
        const profile = readAccountProfile(idValue);
        if (profile && profile.email.toLowerCase() === emailValue.toLowerCase()) {
          localStorage.setItem('marketpulseUserProfile', JSON.stringify(profile));
        } else {
          localStorage.removeItem('marketpulseUserProfile');
        }
        localStorage.setItem('marketpulseUserId', idValue);
        localStorage.setItem('marketpulseUserEmail', emailValue);
        localStorage.setItem('marketpulseKycVerified', 'false');
      } catch (error) {
        console.error('Unable to load the saved account profile.', error);
        alert('Unable to load your account. Please try again.');
        return;
      }

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
      const firstName = $('#signupFirstName').value.trim();
      const lastName = $('#signupLastName').value.trim();
      const email = $('#signupEmail').value.trim();
      const idNumber = $('#signupIdNumber').value.trim();
      const profile = { firstName, lastName, email, idNumber, realBalance: 0 };

      try {
        saveAccountProfile(profile);
      } catch (error) {
        console.error('Unable to save the new account profile.', error);
        alert('Unable to create your account. Please try again.');
        return;
      }

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

  let storedUserId = localStorage.getItem('marketpulseUserId') || '';
  const storedKycFileName = localStorage.getItem('marketpulseKycFileName') || '';
  let currentUserProfile = null;
  const savedCurrentProfile = localStorage.getItem('marketpulseUserProfile');
  if (savedCurrentProfile) {
    try {
      currentUserProfile = JSON.parse(savedCurrentProfile);
    } catch (error) {
      console.error('Unable to read the saved account profile.', error);
      alert('Unable to load your account profile. Please sign in again.');
    }
  }
  const kycState = {
    fileName: storedKycFileName,
    verified: localStorage.getItem('marketpulseKycVerified') === 'true',
  };

  const idDisplayEl = $('#displayIdNumber');
  const idEditBtn = $('#editIdBtn');
  const idEditInput = $('#editIdInput');
  const kycDropzone = $('#kycDropzone');
  const kycFileInput = $('#kycFileInput');
  const kycDropContent = $('#kycDropContent');
  const kycPreviewWrap = $('#kycPreviewWrap');
  const kycImagePreview = $('#kycImagePreview');
  const kycRemoveBtn = $('#kycRemoveBtn');
  const kycStatusBadge = $('#kycStatusBadge');
  const kycSubmitBtn = $('#kycSubmitBtn');
  const defaultDropContent = kycDropContent ? kycDropContent.innerHTML : '';

  function updateKycDisplay() {
    storedUserId = localStorage.getItem('marketpulseUserId') || '';
    if (idDisplayEl) {
      idDisplayEl.textContent = storedUserId || 'Not provided';
    }
    if (idEditInput) {
      idEditInput.value = storedUserId;
    }
    if (kycStatusBadge) {
      kycStatusBadge.textContent = kycState.verified ? 'Verified' : 'Unverified';
      kycStatusBadge.className = 'pill ' + (kycState.verified ? 'success' : 'warning');
    }
    if (kycState.fileName && kycDropContent) {
      kycDropContent.innerHTML = `<p><strong>Selected:</strong> ${kycState.fileName}</p><small>Click to replace or remove</small>`;
    } else if (kycDropContent) {
      kycDropContent.innerHTML = defaultDropContent;
    }
    if (kycPreviewWrap) {
      kycPreviewWrap.style.display = 'none';
    }
  }

  function resetDropzone() {
    if (kycDropContent) kycDropContent.innerHTML = defaultDropContent;
    if (kycPreviewWrap) kycPreviewWrap.style.display = 'none';
    if (kycImagePreview) kycImagePreview.src = '';
    kycState.fileName = '';
    localStorage.removeItem('marketpulseKycFileName');
  }

  function handleKycFile(file) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be 10MB or smaller.');
      return;
    }

    kycState.fileName = file.name;
    localStorage.setItem('marketpulseKycFileName', file.name);
    kycState.verified = false;
    localStorage.setItem('marketpulseKycVerified', 'false');
    updateKycDisplay();

    if (kycDropContent) {
      kycDropContent.innerHTML = `<p><strong>Selected:</strong> ${file.name}</p><small>Click to replace or remove</small>`;
    }

    if (file.type.startsWith('image/') && kycImagePreview && kycPreviewWrap) {
      const reader = new FileReader();
      reader.onload = () => {
        kycImagePreview.src = reader.result;
        kycPreviewWrap.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else if (kycPreviewWrap) {
      kycPreviewWrap.style.display = 'none';
    }
  }

  if (idEditBtn && idEditInput) {
    idEditBtn.addEventListener('click', () => {
      idEditInput.style.display = 'block';
      idEditInput.focus();
    });
  }

  if (idEditInput) {
    idEditInput.addEventListener('change', () => {
      const value = idEditInput.value.trim();
      localStorage.setItem('marketpulseUserId', value);
      storedUserId = value;
      if (idDisplayEl) idDisplayEl.textContent = value || 'Not provided';
    });
  }

  if (kycDropzone && kycFileInput) {
    kycDropzone.addEventListener('click', () => kycFileInput.click());
    kycDropzone.addEventListener('dragover', (event) => {
      event.preventDefault();
      kycDropzone.classList.add('dragover');
    });
    kycDropzone.addEventListener('dragleave', () => {
      kycDropzone.classList.remove('dragover');
    });
    kycDropzone.addEventListener('drop', (event) => {
      event.preventDefault();
      kycDropzone.classList.remove('dragover');
      const file = event.dataTransfer.files[0];
      handleKycFile(file);
    });
  }

  if (kycFileInput) {
    kycFileInput.addEventListener('change', () => {
      const file = kycFileInput.files[0];
      handleKycFile(file);
    });
  }

  if (kycRemoveBtn) {
    kycRemoveBtn.addEventListener('click', () => {
      resetDropzone();
      kycState.verified = false;
      localStorage.setItem('marketpulseKycVerified', 'false');
      updateKycDisplay();
    });
  }

  if (kycSubmitBtn) {
    kycSubmitBtn.addEventListener('click', () => {
      if (!kycState.fileName) {
        alert('Upload your ID photo or document before submitting for verification.');
        return;
      }
      kycSubmitBtn.disabled = true;
      const originalText = kycSubmitBtn.textContent;
      kycSubmitBtn.textContent = 'Submitting...';
      setTimeout(() => {
        kycState.verified = true;
        localStorage.setItem('marketpulseKycVerified', 'true');
        updateKycDisplay();
        kycSubmitBtn.textContent = 'Verified';
        setTimeout(() => {
          kycSubmitBtn.textContent = originalText;
          kycSubmitBtn.disabled = false;
        }, 1200);
      }, 900);
    });
  }

  updateKycDisplay();

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
      pnl: '+$1,430.00',
      pnlClass: 'up-text',
    },
    real: {
      label: 'Real Balance',
      balance: currentUserProfile && Number.isFinite(currentUserProfile.realBalance)
        ? currentUserProfile.realBalance
        : 0,
      sub: 'Live account — funds at risk',
      statSub: '+12.8% this month',
      pnl: '+$342.50',
      pnlClass: 'up-text',
    },
  };

  let currentAccount = 'demo';

  function persistRealBalance() {
    if (!currentUserProfile || !currentUserProfile.idNumber) return;
    currentUserProfile.realBalance = accounts.real.balance;
    const profileJson = JSON.stringify(currentUserProfile);
    localStorage.setItem('marketpulseUserProfile', profileJson);
    localStorage.setItem(accountStorageKey(currentUserProfile.idNumber), profileJson);
  }

  const profileName = currentUserProfile
    ? [currentUserProfile.firstName, currentUserProfile.lastName].filter(Boolean).join(' ')
    : '';
  const userNameEl = $('#userName');
  const userEmailEl = $('#userEmail');
  const userAvatarEl = $('#userAvatar');
  if (userNameEl) userNameEl.textContent = profileName || 'Account holder';
  if (userEmailEl) {
    userEmailEl.textContent = (currentUserProfile && currentUserProfile.email)
      || localStorage.getItem('marketpulseUserEmail')
      || '';
  }
  if (userAvatarEl) {
    const initials = currentUserProfile
      ? [currentUserProfile.firstName, currentUserProfile.lastName]
        .filter(Boolean)
        .map((name) => name.charAt(0).toUpperCase())
        .join('')
      : '';
    userAvatarEl.textContent = initials || 'MP';
  }

  function switchAccount(type) {
    currentAccount = type;
    const acc = accounts[type];
    const dashboardShell = document.querySelector('.dashboard-shell');
    if (dashboardShell) {
      dashboardShell.classList.toggle('real-mode', type === 'real');
      dashboardShell.classList.toggle('demo-mode', type === 'demo');
    }

    // Sidebar
    const labelEl = $('#acctLabel');
    const balEl = $('#acctBalance');
    const subEl = $('#acctSub');
    if (labelEl) labelEl.textContent = acc.label;
    if (balEl) balEl.textContent = '$' + fmt(acc.balance);
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
    if (statBalance) statBalance.textContent = '$' + fmt(acc.balance);
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
  // TRADING PANEL INTERACTIONS
  // ============================================================

  // Payout rate constant
  const PAYOUT_RATE = 0.92;

  function updatePayoutDisplay() {
    const stakeEl = $('#stakeInput');
    if (!stakeEl) return;
    const stake = parseFloat(stakeEl.value) || 0;
    const payout = +(stake * PAYOUT_RATE).toFixed(2);
    const payoutEl = $('#payoutDisplay');
    const pctEl = $('#payoutPct');
    const balEl = $('#tradePanelBalance');

    if (payoutEl) payoutEl.textContent = '+$' + fmt(payout);
    if (pctEl) pctEl.textContent = (PAYOUT_RATE * 100).toFixed(0) + '%';

    const acc = accounts[currentAccount];
    if (balEl) balEl.textContent = '$' + fmt(acc.balance);
  }

  // Keep trading panel balance in sync with account switcher
  function syncTradePanelBalance() {
    const el = $('#tradePanelBalance');
    if (el) {
      const acc = accounts[currentAccount];
      el.textContent = '$' + fmt(acc.balance);
    }
  }

  // Patch switchAccount to also sync trading panel balance
  const _origSwitch = switchAccount;
  window.switchAccount = function(type) {
    _origSwitch(type);
    syncTradePanelBalance();
    updatePayoutDisplay();
  };

  // Contract type tabs
  $$('.trade-type-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('.trade-type-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Stake preset chips
  $$('.stake-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      $$('.stake-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      const stakeInput = $('#stakeInput');
      if (stakeInput) {
        stakeInput.value = chip.dataset.amount;
        updatePayoutDisplay();
      }
    });
  });

  // Stake input manual change
  const stakeInput = $('#stakeInput');
  if (stakeInput) {
    stakeInput.addEventListener('input', () => {
      $$('.stake-chip').forEach((c) => c.classList.remove('active'));
      updatePayoutDisplay();
    });
  }

  // Duration buttons
  $$('.duration-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.duration-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // ============================================================
  // TRADE EXECUTION ENGINE
  // ============================================================
  let tradeActive = false;
  let tradeCountdownInterval = null;
  let toastTimeout = null;

  // Expose placeTrade globally so onclick="placeTrade(...)" works
  window.placeTrade = function placeTrade(direction) {
    if (tradeActive) return;

    const stakeEl = $('#stakeInput');
    const stake = parseFloat(stakeEl ? stakeEl.value : 10) || 10;

    if (stake <= 0 || stake > 10000) {
      showToast('Invalid Stake', 'Enter a stake between $1 and $10,000', 'loss');
      return;
    }

    const acc = accounts[currentAccount];
    if (stake > acc.balance) {
      showToast('Insufficient Balance', 'Your balance is too low for this stake', 'loss');
      return;
    }

    // Get duration
    const activeBtn = document.querySelector('.duration-btn.active');
    const durationSec = activeBtn ? parseInt(activeBtn.dataset.seconds, 10) : 120;

    // Get symbol label
    const symEl = $('#chartSymbol');
    const symLabel = symEl ? symEl.options[symEl.selectedIndex].text : 'VOL 75';

    // Deduct stake from balance
    acc.balance = +(acc.balance - stake).toFixed(2);
    if (currentAccount === 'real') persistRealBalance();
    window.switchAccount(currentAccount); // refresh UI

    // Record entry price
    const entryCandle = currentCandles[currentCandles.length - 1];
    const entryPrice = entryCandle ? entryCandle.close : 0;

    // Lock buttons
    tradeActive = true;
    const callBtn = $('#callBtn');
    const putBtn = $('#putBtn');
    if (callBtn) callBtn.disabled = true;
    if (putBtn) putBtn.disabled = true;

    // Show active trade bar
    const tradeBar = $('#activeTradeBar');
    const iconEl = $('#activeTradeIcon');
    const dirEl = $('#activeTradeDirection');
    const symLblEl = $('#activeTradeSym');
    const stakeEl2 = $('#activeTradeStake');
    const timerEl = $('#activeTradeTimer');
    const fillEl = $('#activeTradeProgressFill');

    if (iconEl) { iconEl.textContent = direction === 'CALL' ? '▲' : '▼'; iconEl.className = 'active-trade-icon ' + direction.toLowerCase(); }
    if (dirEl) dirEl.textContent = direction;
    if (symLblEl) symLblEl.textContent = symLabel;
    if (stakeEl2) stakeEl2.textContent = '$' + fmt(stake);
    if (fillEl) fillEl.style.width = '100%';
    if (tradeBar) tradeBar.style.display = 'flex';

    let remaining = durationSec;

    function formatTime(s) {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return m + ':' + String(sec).padStart(2, '0');
    }

    if (timerEl) timerEl.textContent = formatTime(remaining);

    tradeCountdownInterval = setInterval(() => {
      remaining--;
      const pct = (remaining / durationSec) * 100;
      if (timerEl) timerEl.textContent = formatTime(Math.max(0, remaining));
      if (fillEl) fillEl.style.width = pct + '%';

      if (remaining <= 0) {
        clearInterval(tradeCountdownInterval);
        settleTrade(direction, stake, entryPrice, symLabel);
      }
    }, 1000);
  };

  function settleTrade(direction, stake, entryPrice, symLabel) {
    // Determine win/loss: compare exit price vs entry price to direction
    const exitCandle = currentCandles[currentCandles.length - 1];
    const exitPrice = exitCandle ? exitCandle.close : entryPrice;
    const priceWentUp = exitPrice >= entryPrice;
    const won = (direction === 'CALL' && priceWentUp) || (direction === 'PUT' && !priceWentUp);

    const stake_num = stake;
    const payout = +(stake_num * PAYOUT_RATE).toFixed(2);
    const acc = accounts[currentAccount];

    if (won) {
      acc.balance = +(acc.balance + stake_num + payout).toFixed(2);
    }
    if (currentAccount === 'real') persistRealBalance();

    // Update account UI
    window.switchAccount(currentAccount);

    // Show toast
    if (won) {
      showToast('Trade Won! 🎉', '+$' + fmt(payout) + ' profit credited', 'win');
    } else {
      showToast('Trade Lost', '-$' + fmt(stake_num) + ' stake lost', 'loss');
    }

    // Add to recent trades table
    addTradeRow(symLabel, direction, stake_num, won ? payout : -stake_num);

    // Hide active trade bar & unlock buttons
    const tradeBar = $('#activeTradeBar');
    if (tradeBar) tradeBar.style.display = 'none';

    const callBtn = $('#callBtn');
    const putBtn = $('#putBtn');
    if (callBtn) callBtn.disabled = false;
    if (putBtn) putBtn.disabled = false;

    tradeActive = false;
  }

  function addTradeRow(sym, direction, stake, result) {
    const tbody = document.querySelector('.table-wrap table tbody');
    if (!tbody) return;

    const now = new Date();
    const timeStr = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
    const isWin = result > 0;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${sym}</strong></td>
      <td><span class="trade-type ${direction.toLowerCase()}">${direction}</span></td>
      <td>$${fmt(stake)}</td>
      <td class="${isWin ? 'profit' : 'loss'}">${isWin ? '+' : ''}$${fmt(Math.abs(result))}</td>
      <td class="muted-text">${timeStr}</td>
    `;
    tr.style.animation = 'fadeSlideDown 0.4s ease';
    tbody.insertBefore(tr, tbody.firstChild);

    // Keep last 10 rows
    while (tbody.children.length > 10) tbody.removeChild(tbody.lastChild);
  }

  function showToast(title, msg, type) {
    const toast = $('#tradeToast');
    if (!toast) return;
    const titleEl = $('#tradeToastTitle');
    const msgEl = $('#tradeToastMsg');
    const iconEl = $('#tradeToastIcon');

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = msg;
    if (iconEl) iconEl.textContent = type === 'win' ? '✓' : '✕';

    toast.className = 'trade-toast ' + type + ' show';

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // Init payout display
  updatePayoutDisplay();
  syncTradePanelBalance();


  // ============================================================
  // LIVE CHART (lightweight-charts)
  // ============================================================
  const chartContainer = $('#liveChart');
  let chart, candleSeries, priceUpdateInterval, perfChart;

  function getLiveChartHeight() {
    return window.innerWidth <= 640 ? 360 : 320;
  }

  function resizeCharts() {
    if (chart && chartContainer) {
      chart.applyOptions({
        width: chartContainer.clientWidth,
        height: getLiveChartHeight(),
      });
    }
    if (perfChart) {
      const perfContainer = $('#perfChart');
      if (perfContainer) {
        perfChart.applyOptions({ width: perfContainer.clientWidth });
      }
    }
  }
  window.addEventListener('resize', resizeCharts);
  window.addEventListener('load', () => {
    resizeCharts();
    if (chart) chart.timeScale().fitContent();
    if (perfChart) perfChart.timeScale().fitContent();
  });

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

    chart = LightweightCharts.createChart(chartContainer, {
      width: chartContainer.clientWidth,
      height: getLiveChartHeight(),
      layout: {
        background: { color: '#07131d' },
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
      resizeCharts();
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

    perfChart = LightweightCharts.createChart(perfContainer, {
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

    const ro = new ResizeObserver(() => {
      perfChart.applyOptions({ width: perfContainer.clientWidth });
    });
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
      const pnl = +(18.4 + (Math.random() - 0.5) * 2).toFixed(2);
      if (p1pnl) { p1pnl.textContent = '+$' + fmt(pnl); p1pnl.className = 'position-pnl up-text'; }
    } else {
      if (p1) p1.textContent = 'Closed';
    }
    if (pos2Sec > 0) {
      pos2Sec--;
      const m = Math.floor(pos2Sec / 60), s = pos2Sec % 60;
      if (p2) p2.textContent = m + 'm ' + s + 's';
      const pnl = +(-6.2 + (Math.random() - 0.4) * 3).toFixed(2);
      if (p2pnl) {
        p2pnl.textContent = (pnl >= 0 ? '+' : '') + '$' + fmt(Math.abs(pnl));
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
      ['Vol 75', 'CALL', '$20.00', '+$18.40', '14:32'],
      ['EUR/USD', 'PUT', '$50.00', '-$50.00', '14:18'],
      ['Boom 500', 'CALL', '$30.00', '+$27.60', '13:55'],
      ['Vol 100', 'PUT', '$15.00', '+$13.80', '13:41'],
      ['Crash 500', 'CALL', '$40.00', '-$40.00', '13:20'],
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
