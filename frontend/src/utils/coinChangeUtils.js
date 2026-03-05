/**
 * @fileoverview Frontend Coin Change Algorithm Utilities
 *
 * Pure client-side utility functions for the Coin Change calculator UI.
 * These run entirely in the browser — no server calls, no side effects.
 *
 * Exports:
 *  - parseDenoms   : Parse a comma-separated denomination string
 *  - greedyChange  : Greedy algorithm (fast, not always optimal)
 *  - dpMinCoinsList: Dynamic Programming algorithm (always optimal)
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse a comma-separated string of coin denominations into a sorted array
 * of positive integers. Invalid or non-positive values are silently ignored.
 *
 * @param {string} text - e.g. "1,2,5,10,20,50,100,500,2000"
 * @returns {number[]} Sorted array of valid positive integers (ascending).
 *
 * @example
 * parseDenoms("1, 5, 10, 25")  // => [1, 5, 10, 25]
 * parseDenoms("abc, -3, 10")   // => [10]
 */
export function parseDenoms(text) {
  if (typeof text !== 'string' || text.trim() === '') return [];

  return text
    .split(',')
    .map((x) => parseInt(x.trim(), 10))
    .filter((x) => Number.isInteger(x) && x > 0)
    .sort((a, b) => a - b);
}

// ---------------------------------------------------------------------------
// Greedy Algorithm
// ---------------------------------------------------------------------------

/**
 * Greedy coin change algorithm.
 *
 * Strategy: always pick the largest coin denomination that fits in the
 * remaining amount. Fast (O(n log n)) but does NOT guarantee the minimum
 * number of coins for arbitrary coin systems.
 *
 * @param {number}   amount - Non-negative integer target amount.
 * @param {number[]} coins  - Array of positive integer denominations.
 * @returns {{ used: number[], remaining: number }}
 *   - `used`      : Flat list of coins chosen (e.g. [25, 10, 5, 1])
 *   - `remaining` : Any leftover that could not be matched (ideally 0)
 *
 * @example
 * greedyChange(36, [1, 5, 10, 25])
 * // => { used: [25, 10, 1], remaining: 0 }
 */
export function greedyChange(amount, coins) {
  if (!Number.isInteger(amount) || amount < 0) {
    return { used: [], remaining: amount };
  }
  if (!Array.isArray(coins) || coins.length === 0) {
    return { used: [], remaining: amount };
  }

  const sortedCoins = [...coins].sort((a, b) => b - a); // largest first
  let remaining = amount;
  const used = [];

  for (const coin of sortedCoins) {
    if (coin <= remaining) {
      const count = Math.floor(remaining / coin);
      for (let i = 0; i < count; i++) used.push(coin);
      remaining -= count * coin;
    }
  }

  return { used, remaining };
}

// ---------------------------------------------------------------------------
// Dynamic Programming Algorithm
// ---------------------------------------------------------------------------

/**
 * Dynamic Programming minimum coin-change algorithm.
 *
 * Strategy: bottom-up DP table. Guarantees the minimum number of coins for
 * any coin system. Time: O(amount × |coins|). Space: O(amount).
 *
 * @param {number}   amount - Non-negative integer target amount.
 * @param {number[]} coins  - Array of positive integer denominations.
 * @returns {{ count: number, used: number[], possible: boolean }}
 *   - `count`    : Minimum coins used (-1 if impossible)
 *   - `used`     : Flat list of coins in the optimal solution
 *   - `possible` : Whether an exact solution exists
 *
 * @example
 * dpMinCoinsList(11, [1, 5, 6, 9])
 * // => { count: 2, used: [5, 6], possible: true }
 *
 * // Greedy would return [9, 1, 1] = 3 coins — DP wins here!
 */
export function dpMinCoinsList(amount, coins) {
  if (!Number.isInteger(amount) || amount < 0) {
    return { count: -1, used: [], possible: false };
  }
  if (!Array.isArray(coins) || coins.length === 0) {
    return { count: -1, used: [], possible: false };
  }
  if (amount === 0) {
    return { count: 0, used: [], possible: true };
  }

  const INF = Infinity;
  const dp = new Array(amount + 1).fill(INF);
  const choice = new Array(amount + 1).fill(-1); // tracks which coin was used
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] + 1 < dp[i]) {
        dp[i] = dp[i - coin] + 1;
        choice[i] = coin;
      }
    }
  }

  if (dp[amount] === INF) {
    return { count: -1, used: [], possible: false };
  }

  // Back-track to reconstruct the coin list
  const used = [];
  let cur = amount;
  while (cur > 0) {
    used.push(choice[cur]);
    cur -= choice[cur];
  }

  return { count: dp[amount], used, possible: true };
}
