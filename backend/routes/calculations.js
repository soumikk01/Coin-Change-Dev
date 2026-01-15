const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { calculationsDB } = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Auth middleware
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Save a calculation
router.post('/save', authMiddleware, (req, res) => {
    try {
        const { amount, coins, result, minCoins } = req.body;
        const { id, name, email } = req.user;

        if (!amount || !coins || !result || minCoins === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const calcId = calculationsDB.save(id, name, email, amount, coins, result, minCoins);

        res.status(201).json({
            message: 'Calculation saved successfully',
            id: calcId
        });
    } catch (error) {
        console.error('Save calculation error:', error);
        res.status(500).json({ message: 'Failed to save calculation' });
    }
});

// Get user's calculations
router.get('/history', authMiddleware, (req, res) => {
    try {
        const calculations = calculationsDB.getByUser(req.user.id);
        res.json({ calculations });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ message: 'Failed to get calculations' });
    }
});

module.exports = router;
