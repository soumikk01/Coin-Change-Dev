'use strict';

/**
 * @fileoverview Backend Coin Change Algorithm Utilities
 *
 * Pure server-side utility module. Contains the Greedy and Dynamic
 * Programming implementations of the coin-change problem, plus a
 * comparison helper and a single entry-point function.
 *
 * All functions are pure (no I/O, no side effects). They can be safely
 * called from Express route handlers or any other server-side code.
 *
 * Exports:
 *  - greedyCoinChange            : Greedy algorithm
 *  - dynamicCoinChange           : Dynamic Programming algorithm
 *  - compareCoinChangeAlgorithms : Run both and compare
 *  - solveCoinChange             : Main entry point (validates inputs)
 */

// ---------------------------------------------------------------------------
// Greedy Algorithm
// ---------------------------------------------------------------------------

/**
 * Greedy coin-change algorithm.
 *
 * Always picks the largest denomination that fits the remaining amount.
 * Fast (O(n log n)) but does NOT guarantee the minimum number of coins
 * for arbitrary coin systems.
 *
 * @param {number}   amount - Non-negative integer target amount.
 * @param {number[]} coins  - Array of positive integer denominations.
 * @returns {{
 *   success:    boolean,
 *   algorithm:  'greedy',
 *   totalCoins: number,
 *   breakdown:  Object.<number, number>,
 *   remaining:  number,
 *   message:    string
 * }}
 */
function greedyCoinChange(amount, coins) {
  const sortedCoins = [...coins].sort((a, b) => b - a); // largest first

  let remaining = amount;
  const breakdown = {};
  let totalCoins = 0;

  for (const coin of sortedCoins) {
    if (remaining >= coin) {
      const count = Math.floor(remaining / coin);
      breakdown[coin] = count;
      totalCoins += count;
      remaining -= coin * count;
    }
  }

  const success = remaining === 0;
  return {
    success,
    algorithm: 'greedy',
    totalCoins,
    breakdown,
    remaining,
    message: success
      ? `Greedy: made change using ${totalCoins} coin(s)`
      : `Greedy: cannot make exact change — ${remaining} remaining`,
  };
}

// ---------------------------------------------------------------------------
// Dynamic Programming Algorithm
// ---------------------------------------------------------------------------

/**
 * Dynamic Programming minimum coin-change algorithm.
 *
 * Bottom-up DP table. Guarantees the minimum number of coins for any coin
 * system. Time: O(amount × |coins|). Space: O(amount).
 *
 * @param {number}   amount - Non-negative integer target amount.
 * @param {number[]} coins  - Array of positive integer denominations.
 * @returns {{
 *   success:    boolean,
 *   algorithm:  'dynamic',
 *   totalCoins: number,
 *   breakdown:  Object.<number, number>,
 *   message:    string
 * }}
 */
function dynamicCoinChange(amount, coins) {
  if (amount === 0) {
    return {
      success: true,
      algorithm: 'dynamic',
      totalCoins: 0,
      breakdown: {},
      message: 'Amount is zero — no coins needed',
    };
  }

  const dp = new Array(amount + 1).fill(Infinity);
  const coinUsed = new Array(amount + 1).fill(-1);
  dp[0] = 0;

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
      algorithm: 'dynamic',
      totalCoins: -1,
      breakdown: {},
      message: 'DP: cannot make exact change with the given denominations',
    };
  }

  // Back-track to reconstruct which coins were used
  const breakdown = {};
  let cur = amount;
  while (cur > 0) {
    const coin = coinUsed[cur];
    breakdown[coin] = (breakdown[coin] || 0) + 1;
    cur -= coin;
  }

  return {
    success: true,
    algorithm: 'dynamic',
    totalCoins: dp[amount],
    breakdown,
    message: `DP: optimal solution uses ${dp[amount]} coin(s)`,
  };
}

// ---------------------------------------------------------------------------
// Comparison Helper
// ---------------------------------------------------------------------------

/**
 * Run both the Greedy and Dynamic Programming algorithms on the same input
 * and return a side-by-side comparison.
 *
 * @param {number}   amount - Non-negative integer target amount.
 * @param {number[]} coins  - Array of positive integer denominations.
 * @returns {{
 *   amount:     number,
 *   coins:      number[],
 *   greedy:     object,
 *   dynamic:    object,
 *   comparison: {
 *     greedyIsOptimal: boolean,
 *     coinDifference:  number|null,
 *     recommendation:  string
 *   }
 * }}
 */
function compareCoinChangeAlgorithms(amount, coins) {
  const greedy = greedyCoinChange(amount, coins);
  const dynamic = dynamicCoinChange(amount, coins);

  let recommendation;
  if (!greedy.success && dynamic.success) {
    recommendation =
      'Use Dynamic Programming — Greedy failed to find a solution';
  } else if (
    greedy.success &&
    dynamic.success &&
    greedy.totalCoins > dynamic.totalCoins
  ) {
    recommendation = `Use Dynamic Programming — saves ${greedy.totalCoins - dynamic.totalCoins} coin(s)`;
  } else {
    recommendation = 'Both algorithms give the same result';
  }

  return {
    amount,
    coins,
    greedy,
    dynamic,
    comparison: {
      greedyIsOptimal:
        greedy.success && dynamic.success
          ? greedy.totalCoins === dynamic.totalCoins
          : false,
      coinDifference:
        greedy.success && dynamic.success
          ? greedy.totalCoins - dynamic.totalCoins
          : null,
      recommendation,
    },
  };
}

// ---------------------------------------------------------------------------
// Main Entry Point
// ---------------------------------------------------------------------------

/**
 * Solve the coin-change problem with input validation.
 *
 * This is the function that route handlers should call. It validates the
 * inputs and delegates to the appropriate algorithm.
 *
 * @param {number}   amount               - Target amount (non-negative integer).
 * @param {number[]} coins                - Available denominations.
 * @param {'greedy'|'dynamic'|'dp'|'both'} [algorithm='dynamic'] - Algorithm to use.
 * @returns {object} Result object from the chosen algorithm.
 */
function solveCoinChange(amount, coins, algorithm = 'dynamic') {
  // --- Validate amount ---
  if (!Number.isInteger(amount) || amount < 0) {
    return {
      success: false,
      message: 'Invalid input: amount must be a non-negative integer',
    };
  }

  // --- Validate coins ---
  if (!Array.isArray(coins) || coins.length === 0) {
    return {
      success: false,
      message: 'Invalid input: coins must be a non-empty array',
    };
  }

  const validCoins = coins.filter((c) => Number.isInteger(c) && c > 0);
  if (validCoins.length === 0) {
    return {
      success: false,
      message:
        'Invalid input: no valid positive integer denominations provided',
    };
  }

  // --- Delegate ---
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

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  greedyCoinChange,
  dynamicCoinChange,
  compareCoinChangeAlgorithms,
  solveCoinChange,
};
