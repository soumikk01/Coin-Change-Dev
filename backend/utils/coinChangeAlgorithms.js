/**
 * Coin Change Algorithms
 * Contains both Greedy and Dynamic Programming implementations
 */

/**
 * GREEDY ALGORITHM
 * -----------------
 */
function greedyCoinChange(amount, coins) {
    const sortedCoins = [...coins].sort((a, b) => b - a);

    let remaining = amount;
    const result = {};
    let totalCoins = 0;

    for (const coin of sortedCoins) {
        if (remaining >= coin) {
            const count = Math.floor(remaining / coin);
            result[coin] = count;
            totalCoins += count;
            remaining -= coin * count;
        }
    }

    return {
        success: remaining === 0,
        totalCoins,
        breakdown: result,
        remaining,
        algorithm: 'greedy',
        message: remaining === 0
            ? `Successfully made change using ${totalCoins} coins`
            : `Cannot make exact change. Remaining: ${remaining}`
    };
}

/**
 * DYNAMIC PROGRAMMING ALGORITHM
 * ------------------------------
 */
function dynamicCoinChange(amount, coins) {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;

    const coinUsed = new Array(amount + 1).fill(-1);

    for (let i = 1; i <= amount; i++) {
        for (const coin of coins) {
            if (coin <= i && dp[i - coin] + 1 < dp[i]) {
                dp[i] = dp[i - coin] + 1;
                coinUsed[i] = coin;
            }
        }
    }

    if (dp[amount] === Infinity) {
        return {
            success: false,
            totalCoins: -1,
            breakdown: {},
            algorithm: 'dynamic',
            message: 'Cannot make exact change with given coins'
        };
    }

    // Backtrack to find which coins were used
    const breakdown = {};
    let remaining = amount;

    while (remaining > 0) {
        const coin = coinUsed[remaining];
        breakdown[coin] = (breakdown[coin] || 0) + 1;
        remaining -= coin;
    }

    return {
        success: true,
        totalCoins: dp[amount],
        breakdown,
        algorithm: 'dynamic',
        message: `Optimal solution found using ${dp[amount]} coins`
    };
}

/**
 * COMPARE BOTH ALGORITHMS
 * Shows the difference between greedy and optimal solutions
 * 
 * @param {number} amount - Target amount
 * @param {number[]} coins - Available coin denominations
 * @returns {Object} Comparison of both algorithms
 */
function compareCoinChangeAlgorithms(amount, coins) {
    const greedyResult = greedyCoinChange(amount, coins);
    const dpResult = dynamicCoinChange(amount, coins);

    return {
        amount,
        coins,
        greedy: greedyResult,
        dynamic: dpResult,
        comparison: {
            greedyIsOptimal: greedyResult.totalCoins === dpResult.totalCoins,
            difference: greedyResult.success && dpResult.success
                ? greedyResult.totalCoins - dpResult.totalCoins
                : null,
            recommendation: !greedyResult.success && dpResult.success
                ? 'Use Dynamic Programming - Greedy failed to find a solution'
                : greedyResult.totalCoins > dpResult.totalCoins
                    ? 'Use Dynamic Programming for optimal solution'
                    : 'Both algorithms give the same result'
        }
    };
}

/**
 * SOLVE COIN CHANGE (Main function)
 * Uses Dynamic Programming by default for optimal results
 * 
 * @param {number} amount - Target amount
 * @param {number[]} coins - Available coin denominations
 * @param {string} algorithm - 'greedy', 'dynamic', or 'both'
 * @returns {Object} Solution result
 */
function solveCoinChange(amount, coins, algorithm = 'dynamic') {
    // Validate inputs
    if (!Number.isInteger(amount) || amount < 0) {
        return { success: false, message: 'Amount must be a non-negative integer' };
    }

    if (!Array.isArray(coins) || coins.length === 0) {
        return { success: false, message: 'Coins must be a non-empty array' };
    }

    // Filter and validate coins
    const validCoins = coins.filter(c => Number.isInteger(c) && c > 0);
    if (validCoins.length === 0) {
        return { success: false, message: 'No valid coins provided' };
    }

    switch (algorithm.toLowerCase()) {
        case 'greedy':
            return greedyCoinChange(amount, validCoins);
        case 'dynamic':
        case 'dp':
            return dynamicCoinChange(amount, validCoins);
        case 'both':
        case 'compare':
            return compareCoinChangeAlgorithms(amount, validCoins);
        default:
            return dynamicCoinChange(amount, validCoins);
    }
}

module.exports = {
    greedyCoinChange,
    dynamicCoinChange,
    compareCoinChangeAlgorithms,
    solveCoinChange
};
