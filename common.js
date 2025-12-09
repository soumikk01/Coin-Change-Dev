// Utilities
function parseDenoms(text) {
  return text.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x) && x > 0).sort((a, b) => a - b);
}

function greedyChange(amount, coins) {
  let remaining = amount;
  const used = [];
  const coinsSorted = [...coins].sort((a, b) => b - a);
  for (const c of coinsSorted) {
    const count = Math.floor(remaining / c);
    for (let i = 0; i < count; i++) used.push(c);
    remaining -= count * c;
  }
  return { used, remaining };
}

function dpMinCoinsList(amount, coins) {
  const INF = 1e9;
  const dp = Array(amount + 1).fill(INF);
  const choice = Array(amount + 1).fill(-1);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const c of coins) {
      if (c <= i && dp[i - c] + 1 < dp[i]) { dp[i] = dp[i - c] + 1; choice[i] = c; }
    }
  }
  if (dp[amount] >= INF) return { count: -1, used: [], possible: false };
  const used = [];
  let cur = amount;
  while (cur > 0) { used.push(choice[cur]); cur -= choice[cur]; }
  return { count: dp[amount], used, possible: true };
}

// DOM refs
const amountInput = document.getElementById('amount');
let currentDenoms = '1,2,5,10,20,50,100,500,2000';
const runBtn = document.getElementById('run');
const rangeBtn = document.getElementById('rangePlot');
const summary = document.getElementById('summary');
const counts = document.getElementById('counts');
const greedyBox = document.getElementById('greedyBox');
const dpBox = document.getElementById('dpBox');
const breakdown = document.getElementById('breakdown');
const denomChips = document.getElementById('denomChips');
const customizeBtn = document.getElementById('customizeBtn');
const customDenomsInput = document.getElementById('customDenoms');

// Only run calculator code if we're on the calculator page
if (amountInput && runBtn) {
  // Chart setup
  const ctx = document.getElementById('chart').getContext('2d');
  let chart = null;

  function renderChips(coins) {
    denomChips.innerHTML = '';
    for (const c of coins) {
      const el = document.createElement('div'); el.className = 'chip'; el.textContent = c; denomChips.appendChild(el);
    }
  }

  function getCurrentDenoms() {
    return customDenomsInput.classList.contains('show') && customDenomsInput.value.trim()
      ? customDenomsInput.value.trim()
      : currentDenoms;
  }

  function showResults() {
    const amount = Math.max(0, Math.floor(Number(amountInput.value) || 0));
    const denomsStr = getCurrentDenoms();
    const coins = parseDenoms(denomsStr);
    if (coins.length === 0) { alert('Please enter at least one denomination (positive integers).'); return; }
    currentDenoms = denomsStr;
    customDenomsInput.value = denomsStr;
    renderChips(coins);

    const g = greedyChange(amount, coins);
    const dp = dpMinCoinsList(amount, coins);

    counts.innerHTML = `<small class="muted">Greedy:</small> <b>${g.used.length}</b> &nbsp; | &nbsp; <small class="muted">DP:</small> <b>${dp.count}</b>`;

    greedyBox.style.display = 'flex'; dpBox.style.display = 'flex'; breakdown.style.display = 'block';

    greedyBox.innerHTML = `<div><b>Greedy</b><div style="font-size:13px;color:var(--muted);margin-top:6px">${g.used.join(' + ') || '—'}</div></div><div>${g.used.length} coins</div>`;
    dpBox.innerHTML = `<div><b>Dynamic Programming</b><div style="font-size:13px;color:var(--muted);margin-top:6px">${dp.used.join(' + ') || '—'}</div></div><div>${dp.count}</div>`;

    // update chart for single amount (bar showing counts)
    updateSingleChart(amount, coins, g.used.length, dp.count);
  }

  function updateSingleChart(amount, coins, greedyCount, dpCount) {
    const labels = ['Greedy', 'DP'];
    const data = [greedyCount, dpCount < 0 ? 0 : dpCount];
    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets[0].data = data;
      chart.update('active');
      return;
    }
    chart = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: `Coins for ${amount}`, data, backgroundColor: ['rgba(124,58,237,0.8)', 'rgba(59,130,246,0.8)'] }] },
      options: {
        animation: {
          duration: 1500,
          easing: 'easeOutQuart'
        },
        scales: { y: { beginAtZero: true, precision: 0 } }, plugins: { legend: { display: false } }
      }
    });
  }

  function plotRange(maxAmount = 200) {
    const denomsStr = getCurrentDenoms();
    const coins = parseDenoms(denomsStr);
    if (coins.length === 0) { alert('Enter denominations first.'); return; }
    const amounts = Array.from({ length: maxAmount }, (_, i) => i + 1);
    const greedyCounts = amounts.map(a => greedyChange(a, coins).used.length);
    const dpCounts = amounts.map(a => dpMinCoinsList(a, coins).count);

    // new line chart
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: amounts,
        datasets: [
          {
            label: 'Greedy',
            data: greedyCounts,
            tension: 0.2,
            pointRadius: 2,
            borderColor: 'rgba(124,58,237,0.8)',
            backgroundColor: 'rgba(124,58,237,0.1)',
            fill: false
          },
          {
            label: 'DP',
            data: dpCounts,
            tension: 0.2,
            pointRadius: 2,
            borderColor: 'rgba(59,130,246,0.8)',
            backgroundColor: 'rgba(59,130,246,0.1)',
            fill: false
          }
        ]
      },
      options: {
        animation: {
          duration: 2000,
          easing: 'easeOutQuart',
          x: {
            type: 'number',
            easing: 'linear',
            from: NaN
          },
          y: {
            type: 'number',
            easing: 'easeOutQuart',
            from: (ctx) => ctx.chart.scales.y.min
          }
        },
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: { title: { display: true, text: 'Amount' } },
          y: { title: { display: true, text: '# Coins' }, beginAtZero: true }
        }
      }
    });
  }

  // Customize button functionality
  customizeBtn.addEventListener('click', () => {
    const isShowing = customDenomsInput.classList.contains('show');
    if (isShowing) {
      customDenomsInput.classList.remove('show');
      customizeBtn.textContent = 'Customize';
      customizeBtn.classList.remove('active');
      // Save and apply custom denominations
      const denomsStr = customDenomsInput.value.trim() || currentDenoms;
      currentDenoms = denomsStr;
      const coins = parseDenoms(denomsStr);
      if (coins.length > 0) {
        renderChips(coins);
      }
    } else {
      customDenomsInput.classList.add('show');
      customizeBtn.textContent = 'Apply';
      customizeBtn.classList.add('active');
      customDenomsInput.focus();
    }
  });

  // Apply on Enter key in custom input
  customDenomsInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const denomsStr = customDenomsInput.value.trim() || currentDenoms;
      currentDenoms = denomsStr;
      const coins = parseDenoms(denomsStr);
      if (coins.length > 0) {
        renderChips(coins);
        customDenomsInput.classList.remove('show');
        customizeBtn.textContent = 'Customize';
        customizeBtn.classList.remove('active');
      } else {
        alert('Please enter valid denominations (comma-separated positive integers).');
      }
    }
  });

  runBtn.addEventListener('click', () => {
    // Remove active class from both buttons
    runBtn.classList.remove('active');
    rangeBtn.classList.remove('active');
    // Add active class to clicked button
    runBtn.classList.add('active');
    showResults();
  });
  rangeBtn.addEventListener('click', () => {
    // Remove active class from both buttons
    runBtn.classList.remove('active');
    rangeBtn.classList.remove('active');
    // Add active class to clicked button
    rangeBtn.classList.add('active');
    plotRange(200);
  });

  // Save button functionality
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const amount = Math.max(0, Math.floor(Number(amountInput.value) || 0));
      const denomsStr = getCurrentDenoms();
      const coins = parseDenoms(denomsStr);

      if (amount === 0 || coins.length === 0) {
        alert('Please compute a result first before saving!');
        return;
      }

      const g = greedyChange(amount, coins);
      const dp = dpMinCoinsList(amount, coins);

      // Create save data object
      const saveData = {
        timestamp: new Date().toISOString(),
        amount: amount,
        denominations: coins,
        greedy: {
          coinsUsed: g.used,
          totalCoins: g.used.length,
          remaining: g.remaining,
          breakdown: g.used.join(' + ')
        },
        dynamic: {
          coinsUsed: dp.used,
          totalCoins: dp.count,
          possible: dp.possible,
          breakdown: dp.used.join(' + ')
        }
      };

      // Download as JSON file
      const dataStr = JSON.stringify(saveData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `coin-change-result-${amount}-${Date.now()}.json`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);

      // Show success feedback
      saveBtn.textContent = '✓ Saved!';
      saveBtn.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
      setTimeout(() => {
        saveBtn.textContent = '💾 Save';
        saveBtn.style.backgroundColor = '';
      }, 2000);
    });
  }

  // Set last updated date
  if (document.getElementById('lastUpdated')) {
    document.getElementById('lastUpdated').textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Terms toggle functionality
  const termsToggle = document.getElementById('termsToggle');
  const termsContent = document.getElementById('termsContent');
  if (termsToggle && termsContent) {
    termsToggle.addEventListener('click', () => {
      const isExpanded = termsContent.classList.contains('expanded');
      if (isExpanded) {
        termsContent.classList.remove('expanded');
        termsToggle.textContent = 'Show details';
      } else {
        termsContent.classList.add('expanded');
        termsToggle.textContent = 'Hide details';
      }
    });
  }

  // initial render
  renderChips(parseDenoms(currentDenoms));
  // create a minimal initial chart
  chart = new Chart(ctx, {
    type: 'bar',
    data: { labels: ['Greedy', 'DP'], datasets: [{ label: 'Coins', data: [0, 0], backgroundColor: ['rgba(124,58,237,0.8)', 'rgba(59,130,246,0.8)'] }] },
    options: {
      animation: {
        duration: 1500,
        easing: 'easeOutQuart'
      },
      scales: { y: { beginAtZero: true, precision: 0 } },
      plugins: { legend: { display: false } }
    }
  });
}

// ========================================
// LOGIN PAGE CODE
// ========================================
// GET DOM ELEMENTS
// ========================================
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const emailInput = document.getElementById('email');
const loginForm = document.getElementById('loginForm');
const loginButton = document.getElementById('loginButton');
const loadingOverlay = document.getElementById('loadingOverlay');
const loginCard = document.getElementById('loginCard');
const successMessage = document.getElementById('successMessage');

// ========================================
// PASSWORD TOGGLE
// ========================================
togglePassword.addEventListener('click', () => {
  const type = passwordInput.type === 'password' ? 'text' : 'password';
  passwordInput.type = type;

  // Update icon
  const icon = togglePassword.querySelector('.eye-icon');
  if (type === 'text') {
    icon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.76 6.76m3.119 3.118l4.242 4.242m0 0l3.119 3.119m-3.12-3.119L21.24 21.24"/>
      `;
  } else {
    icon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
      `;
  }

  // Add animation
  togglePassword.style.transform = 'scale(0.9)';
  setTimeout(() => {
    togglePassword.style.transform = 'scale(1)';
  }, 100);
});

// ========================================
// INPUT VALIDATION & ANIMATIONS
// ========================================
const addInputAnimation = (input) => {
  input.addEventListener('focus', () => {
    input.parentElement.style.transform = 'scale(1.01)';
  });

  input.addEventListener('blur', () => {
    input.parentElement.style.transform = 'scale(1)';
  });

  input.addEventListener('input', () => {
    // Add subtle animation on input
    if (input.value.length > 0) {
      input.style.borderColor = 'rgba(59, 130, 246, 0.5)';
    } else {
      input.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }
  });
};

addInputAnimation(emailInput);
addInputAnimation(passwordInput);

// ========================================
// FORM SUBMISSION
// ========================================
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Get form values
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // Basic validation
  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address');
    emailInput.focus();
    return;
  }

  // Show loading state
  loginButton.classList.add('loading');
  loginButton.disabled = true;

  // Show loading overlay
  loadingOverlay.classList.add('active');

  try {
    // Simulate API call (replace with actual authentication)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Store login state (optional)
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);

    // Redirect to main page
    window.location.href = 'index.html';

  } catch (error) {
    // Hide loading
    loginButton.classList.remove('loading');
    loginButton.disabled = false;
    loadingOverlay.classList.remove('active');

    // Show error
    alert('Login failed. Please try again.');
    console.error('Login error:', error);
  }
});

// ========================================
// SOCIAL LOGIN HANDLERS
// ========================================
const googleLogin = document.getElementById('googleLogin');
const githubLogin = document.getElementById('githubLogin');

googleLogin?.addEventListener('click', () => {
  alert('Google login will be implemented with OAuth');
  // TODO: Implement Google OAuth
});

githubLogin?.addEventListener('click', () => {
  alert('GitHub login will be implemented with OAuth');
  // TODO: Implement GitHub OAuth
});

// ========================================
// FORGOT PASSWORD HANDLER
// ========================================
const forgotPassword = document.getElementById('forgotPassword');
forgotPassword?.addEventListener('click', (e) => {
  e.preventDefault();
  alert('Password reset functionality will be implemented');
  // TODO: Implement password reset
});

// ========================================
// SIGNUP LINK HANDLER
// ========================================
// ========================================
// AUTH VIEW TOGGLE
// ========================================
const loginView = document.getElementById('loginView');
const signupView = document.getElementById('signupView');
const showSignupBtn = document.getElementById('showSignup');
const showLoginBtn = document.getElementById('showLogin');

if (showSignupBtn && showLoginBtn) {
  showSignupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginView.style.display = 'none';
    signupView.style.display = 'block';
    // Update URL without reloading (optional)
    history.pushState(null, '', '?mode=signup');
  });

  showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signupView.style.display = 'none';
    loginView.style.display = 'block';
    history.pushState(null, '', '?mode=login');
  });

  // Check URL param on load
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mode') === 'signup') {
    loginView.style.display = 'none';
    signupView.style.display = 'block';
  }
}

// ========================================
// SIGNUP FORM HANDLER
// ========================================
const signupForm = document.getElementById('signupForm');
const signupButton = document.getElementById('signupButton');

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!fullname || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Show loading state
    signupButton.classList.add('loading');
    signupButton.disabled = true;
    loadingOverlay.classList.add('active');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Store login state
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', fullname);

      // Redirect to main page
      window.location.href = 'index.html';

    } catch (error) {
      signupButton.classList.remove('loading');
      signupButton.disabled = false;
      loadingOverlay.classList.remove('active');
      alert('Signup failed. Please try again.');
      console.error('Signup error:', error);
    }
  });
}

