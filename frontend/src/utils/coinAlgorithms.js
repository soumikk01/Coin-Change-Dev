// Coin Change Algorithms

/**
 * Parse denomination string to sorted array
 */
export function parseDenoms(text) {
    return text
        .split(',')
        .map(x => parseInt(x.trim()))
        .filter(x => !isNaN(x) && x > 0)
        .sort((a, b) => a - b);
}

/**
 * Greedy algorithm for coin change
 * @returns {{ used: number[], remaining: number }}
 */
export function greedyChange(amount, coins) {
    let remaining = amount;
    const used = [];
    const coinsSorted = [...coins].sort((a, b) => b - a);

    for (const c of coinsSorted) {
        const count = Math.floor(remaining / c);
        for (let i = 0; i < count; i++) {
            used.push(c);
        }
        remaining -= count * c;
    }

    return { used, remaining };
}

/**
 * Dynamic Programming algorithm for minimum coin change
 * @returns {{ count: number, used: number[], possible: boolean }}
 */
export function dpMinCoinsList(amount, coins) {
    const INF = 1e9;
    const dp = Array(amount + 1).fill(INF);
    const choice = Array(amount + 1).fill(-1);
    dp[0] = 0;

    for (let i = 1; i <= amount; i++) {
        for (const c of coins) {
            if (c <= i && dp[i - c] + 1 < dp[i]) {
                dp[i] = dp[i - c] + 1;
                choice[i] = c;
            }
        }
    }

    if (dp[amount] >= INF) {
        return { count: -1, used: [], possible: false };
    }

    const used = [];
    let cur = amount;
    while (cur > 0) {
        used.push(choice[cur]);
        cur -= choice[cur];
    }

    return { count: dp[amount], used, possible: true };
}
