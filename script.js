// Utilities
function parseDenoms(text) {
  return text.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x) && x > 0).sort((a, b) => a - b);
}
// Greedy Change Algorithm 
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
// Dynamic Programming Change Algorithm
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

// Set last updated date
document.getElementById('lastUpdated').textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

// Terms toggle functionality
const termsToggle = document.getElementById('termsToggle');
const termsContent = document.getElementById('termsContent');
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
