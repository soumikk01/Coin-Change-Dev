import { useState, useRef, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import Navbar from '../components/Navbar';
import { parseDenoms, greedyChange, dpMinCoinsList } from '../utils/coinAlgorithms';
import './CalculatorPage.css';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

function CalculatorPage() {
    const [amount, setAmount] = useState('');
    const [denomsString, setDenomsString] = useState('1,2,5,10,20,50,100,500,2000');
    const [showCustomize, setShowCustomize] = useState(false);
    const [greedyResult, setGreedyResult] = useState(null);
    const [dpResult, setDpResult] = useState(null);
    const [chartType, setChartType] = useState('bar'); // 'bar' or 'line'
    const [chartData, setChartData] = useState(null);
    const [activeButton, setActiveButton] = useState(null);

    const coins = parseDenoms(denomsString);

    // Compute single amount
    const handleCompute = () => {
        const amt = Math.max(0, Math.floor(Number(amount) || 0));
        if (coins.length === 0) {
            alert('Please enter at least one denomination (positive integers).');
            return;
        }

        const g = greedyChange(amt, coins);
        const dp = dpMinCoinsList(amt, coins);

        setGreedyResult(g);
        setDpResult(dp);
        setActiveButton('compute');
        setChartType('bar');
        setChartData({
            labels: ['Greedy', 'DP'],
            datasets: [{
                label: `Coins for ${amt}`,
                data: [g.used.length, dp.count < 0 ? 0 : dp.count],
                backgroundColor: ['rgba(124, 58, 237, 0.8)', 'rgba(59, 130, 246, 0.8)']
            }]
        });
    };

    // Plot range 1-200
    const handlePlotRange = () => {
        if (coins.length === 0) {
            alert('Enter denominations first.');
            return;
        }

        const amounts = Array.from({ length: 200 }, (_, i) => i + 1);
        const greedyCounts = amounts.map(a => greedyChange(a, coins).used.length);
        const dpCounts = amounts.map(a => dpMinCoinsList(a, coins).count);

        setActiveButton('range');
        setChartType('line');
        setChartData({
            labels: amounts,
            datasets: [
                {
                    label: 'Greedy',
                    data: greedyCounts,
                    tension: 0.2,
                    pointRadius: 2,
                    borderColor: 'rgba(124, 58, 237, 0.8)',
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    fill: false
                },
                {
                    label: 'DP',
                    data: dpCounts,
                    tension: 0.2,
                    pointRadius: 2,
                    borderColor: 'rgba(59, 130, 246, 0.8)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: false
                }
            ]
        });
    };

    // Save results to backend
    const handleSave = async () => {
        const amt = Math.max(0, Math.floor(Number(amount) || 0));
        if (amt === 0 || coins.length === 0 || !greedyResult) {
            alert('Please compute a result first before saving!');
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Please login to save your calculations.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/calculations/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: amt,
                    coins: coins,
                    result: {
                        greedy: {
                            coins: greedyResult.used,
                            count: greedyResult.used.length,
                            remaining: greedyResult.remaining
                        },
                        dp: {
                            coins: dpResult.used,
                            count: dpResult.count,
                            possible: dpResult.possible
                        }
                    },
                    minCoins: dpResult.count
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('✅ Calculation saved successfully!');
            } else {
                alert(data.message || 'Failed to save calculation');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save. Please try again.');
        }
    };

    // Apply custom denominations
    const handleApplyDenoms = () => {
        const newCoins = parseDenoms(denomsString);
        if (newCoins.length > 0) {
            setShowCustomize(false);
        } else {
            alert('Please enter valid denominations (comma-separated positive integers).');
        }
    };

    const barOptions = {
        animation: { duration: 1500, easing: 'easeOutQuart' },
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } }
    };

    const lineOptions = {
        animation: { duration: 2000, easing: 'easeOutQuart' },
        interaction: { mode: 'index', intersect: false },
        scales: {
            x: { title: { display: true, text: 'Amount' } },
            y: { title: { display: true, text: '# Coins' }, beginAtZero: true }
        }
    };

    return (
        <>
            <Navbar />
            <div className="calculator-page">
                <div className="container">
                    {/* Header Section */}
                    <div className="page-header">
                        <p className="header-subtitle">Algorithm Comparison Tool</p>
                        <h1 className="header-title">Minimum Coin Change — Interactive</h1>
                        <p className="header-description">
                            Compare Greedy and Dynamic Programming approaches. Use custom denominations,
                            view detailed breakdowns, and explore interactive charts.
                        </p>
                    </div>

                    {/* Main Content */}
                    <div className="main-layout">
                        {/* Left Column - Calculator */}
                        <div className="calculator-section">
                            <div className="grid">
                                {/* Input Card */}
                                <div className="card">
                                    <div className="section-title">Input Amount</div>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Pass Inputs"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleCompute()}
                                    />
                                    <small className="muted">Enter the amount to make (e.g. 93)</small>

                                    <div className="button-group">
                                        <button
                                            className={activeButton === 'compute' ? 'active' : ''}
                                            onClick={handleCompute}
                                        >
                                            Compute
                                        </button>
                                        <button
                                            className={`ghost ${activeButton === 'range' ? 'active' : ''}`}
                                            onClick={handlePlotRange}
                                        >
                                            Plot 1–200
                                        </button>
                                        <button className="ghost" onClick={handleSave}>
                                            💾 Save
                                        </button>
                                    </div>

                                    <div className="footer">
                                        Tip: Use the <em>Plot 1–200</em> to visualize how coin counts differ across amounts.
                                    </div>
                                </div>

                                {/* Denomination Card */}
                                <div className="card denom-card">
                                    <div className="section-title">Denomination set</div>
                                    <div className="denom-list">
                                        {coins.map((coin, index) => (
                                            <div key={index} className="chip">{coin}</div>
                                        ))}
                                    </div>
                                    <div className="customize-container">
                                        <button
                                            className={`customize-btn ${showCustomize ? 'active' : ''}`}
                                            onClick={() => {
                                                if (showCustomize) {
                                                    handleApplyDenoms();
                                                } else {
                                                    setShowCustomize(true);
                                                }
                                            }}
                                        >
                                            {showCustomize ? 'Apply' : 'Customize'}
                                        </button>
                                        {showCustomize && (
                                            <input
                                                type="text"
                                                className="customize-input"
                                                placeholder="e.g., 1,2,5,10,20,50,100,500,2000"
                                                value={denomsString}
                                                onChange={(e) => setDenomsString(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleApplyDenoms()}
                                                autoFocus
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Results Card */}
                                <div className="card">
                                    <div className="results">
                                        <div className="section-title">Results</div>
                                        <div className="result-line">
                                            <div>
                                                <b>{greedyResult || dpResult ? 'Comparison' : 'Run to see results'}</b>
                                            </div>
                                            {greedyResult && dpResult && (
                                                <div className="counts">
                                                    <small className="muted">Greedy:</small> <b>{greedyResult.used.length}</b>
                                                    &nbsp; | &nbsp;
                                                    <small className="muted">DP:</small> <b>{dpResult.count}</b>
                                                </div>
                                            )}
                                        </div>

                                        {greedyResult && dpResult && (
                                            <div className="breakdown">
                                                <div className="section-title">Breakdown</div>
                                                <div className="result-line">
                                                    <div>
                                                        <b>Greedy</b>
                                                        <div className="breakdown-coins">
                                                            {greedyResult.used.join(' + ') || '—'}
                                                        </div>
                                                    </div>
                                                    <div>{greedyResult.used.length} coins</div>
                                                </div>
                                                <div className="result-line">
                                                    <div>
                                                        <b>Dynamic Programming</b>
                                                        <div className="breakdown-coins">
                                                            {dpResult.used.join(' + ') || '—'}
                                                        </div>
                                                    </div>
                                                    <div>{dpResult.count}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Chart Card */}
                                <div className="card">
                                    <div className="section-title">Chart</div>
                                    <div className="chart-container">
                                        {chartData ? (
                                            chartType === 'bar' ? (
                                                <Bar data={chartData} options={barOptions} />
                                            ) : (
                                                <Line data={chartData} options={lineOptions} />
                                            )
                                        ) : (
                                            <div className="chart-placeholder">
                                                Run a computation to see the chart
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Explanation */}
                        <div className="explanation-section">
                            <div className="card explanation-card">
                                <div className="section-title">📚 Explain - How It Works</div>

                                <div className="explanation-content">
                                    <h3 className="explanation-heading blue">💡 The Coin Change Problem</h3>
                                    <p className="explanation-text">
                                        Given a target amount and a set of coin denominations, find the minimum number of
                                        coins needed to make that amount.
                                    </p>

                                    <h3 className="explanation-heading blue">⚡ Greedy Algorithm</h3>
                                    <p className="explanation-text">
                                        <strong>How it works:</strong> Always picks the largest coin that doesn't exceed the
                                        remaining amount.
                                    </p>
                                    <ul className="explanation-list">
                                        <li><strong>Fast:</strong> O(n log n) time</li>
                                        <li><strong>Simple:</strong> Easy to implement</li>
                                        <li><strong>Not Optimal:</strong> Doesn't guarantee minimum</li>
                                    </ul>

                                    <h3 className="explanation-heading pink">🎯 Dynamic Programming</h3>
                                    <p className="explanation-text">
                                        <strong>How it works:</strong> Builds solutions from bottom-up to find the true
                                        minimum.
                                    </p>
                                    <ul className="explanation-list">
                                        <li><strong>Optimal:</strong> Guarantees minimum coins</li>
                                        <li><strong>Slower:</strong> O(amount × coins)</li>
                                        <li><strong>Complex:</strong> Uses memorization</li>
                                    </ul>

                                    <h3 className="explanation-heading purple">⚖️ When to Use Each</h3>
                                    <div className="comparison-boxes">
                                        <div className="comparison-box blue">
                                            <div className="comparison-title">Use Greedy When:</div>
                                            <ul>
                                                <li>Speed is critical</li>
                                                <li>Standard coin systems</li>
                                            </ul>
                                        </div>
                                        <div className="comparison-box pink">
                                            <div className="comparison-title">Use DP When:</div>
                                            <ul>
                                                <li>Need optimal solution</li>
                                                <li>Custom coin systems</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="page-footer">
                        <p><strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CalculatorPage;
