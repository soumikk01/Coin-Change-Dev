'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { calculationsDB } = require('../database/db');
const { solveCoinChange } = require('../utils/coinChangeAlgorithms');

const JWT_SECRET = process.env.JWT_SECRET || 'coinchanger-secret-key-2024';

// ---------------------------------------------------------------------------
// Auth Middleware
// ---------------------------------------------------------------------------

/**
 * Validates the JWT Bearer token on protected routes.
 * Attaches the decoded user payload to `req.user`.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// ---------------------------------------------------------------------------
// POST /api/calculations/calculate  (public — no auth required)
// ---------------------------------------------------------------------------

/**
 * Run the coin-change algorithm server-side.
 *
 * Body: { amount: number, coins: number[], algorithm?: 'greedy'|'dynamic'|'both' }
 *
 * Returns the full algorithm result from coinChangeAlgorithms utility.
 */
router.post('/calculate', (req, res) => {
  try {
    const { amount, coins, algorithm = 'dynamic' } = req.body;

    if (amount === undefined || amount === null) {
      return res
        .status(400)
        .json({ message: 'Missing required field: amount' });
    }
    if (!Array.isArray(coins) || coins.length === 0) {
      return res
        .status(400)
        .json({
          message: 'Missing required field: coins (must be a non-empty array)',
        });
    }

    const parsedAmount = Number(amount);
    if (!Number.isInteger(parsedAmount) || parsedAmount < 0) {
      return res
        .status(400)
        .json({
          message: 'Invalid value: amount must be a non-negative integer',
        });
    }

    const result = solveCoinChange(parsedAmount, coins, algorithm);

    if (!result.success && result.message?.startsWith('Invalid input')) {
      return res.status(400).json({ message: result.message });
    }

    return res.json(result);
  } catch (error) {
    console.error('[Calculate] Unexpected error:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error during calculation' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/calculations/save  (protected)
// ---------------------------------------------------------------------------

/**
 * Save a completed calculation to the database.
 *
 * Body: { amount, coins, result, minCoins }
 * Requires: Authorization: Bearer <token>
 */
router.post('/save', authMiddleware, (req, res) => {
  try {
    const { amount, coins, result, minCoins } = req.body;
    const { id, name, email } = req.user;

    if (
      amount === undefined ||
      amount === null ||
      !coins ||
      !result ||
      minCoins === undefined
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const calcId = calculationsDB.save(
      id,
      name,
      email,
      amount,
      coins,
      result,
      minCoins
    );

    return res.status(201).json({
      message: 'Calculation saved successfully',
      id: calcId,
    });
  } catch (error) {
    console.error('[Save] Error:', error);
    return res.status(500).json({ message: 'Failed to save calculation' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/calculations/history  (protected)
// ---------------------------------------------------------------------------

/**
 * Retrieve the authenticated user's saved calculation history.
 *
 * Requires: Authorization: Bearer <token>
 */
router.get('/history', authMiddleware, (req, res) => {
  try {
    const calculations = calculationsDB.getByUser(req.user.id);
    return res.json({ calculations });
  } catch (error) {
    console.error('[History] Error:', error);
    return res
      .status(500)
      .json({ message: 'Failed to retrieve calculation history' });
  }
});

module.exports = router;
