const express = require('express');
const jwt = require('jsonwebtoken');
const { userDB, calculationsDB } = require('../database/db');

const router = express.Router();
const JWT_SECRET = 'coinchanger-secret-key-2024';

// Middleware to verify admin
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Get all users - GET /api/admin/users
router.get('/users', verifyAdmin, (req, res) => {
    try {
        const users = userDB.getAll();
        const count = userDB.count();

        console.log(`📊 Admin viewed users list (${count} total)`);

        res.json({
            message: 'Users retrieved successfully',
            total: count,
            users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Get all calculations - GET /api/admin/calculations
router.get('/calculations', verifyAdmin, (req, res) => {
    try {
        const calculations = calculationsDB.getAll();
        const count = calculationsDB.count();

        console.log(`📊 Admin viewed calculations list (${count} total)`);

        res.json({
            message: 'Calculations retrieved successfully',
            total: count,
            calculations
        });
    } catch (error) {
        console.error('Error fetching calculations:', error);
        res.status(500).json({ message: 'Error fetching calculations' });
    }
});

// Get user stats - GET /api/admin/stats
router.get('/stats', verifyAdmin, (req, res) => {
    try {
        const totalUsers = userDB.count();
        const users = userDB.getAll();
        const admins = users.filter(u => u.role === 'admin').length;
        const regularUsers = totalUsers - admins;
        const totalCalculations = calculationsDB.count();

        res.json({
            totalUsers,
            admins,
            regularUsers,
            totalCalculations
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

module.exports = router;

