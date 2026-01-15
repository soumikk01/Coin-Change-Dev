const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const calculationsRoutes = require('./routes/calculations');
const { initDB } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/calculations', calculationsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running', database: 'SQLite' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Initialize database and start server
async function start() {
    await initDB();
    app.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 Database: SQLite (local file)`);
        console.log(`\n📋 Available endpoints:`);
        console.log(`   POST /api/auth/signup - Register new user`);
        console.log(`   POST /api/auth/login  - Login user`);
        console.log(`   GET  /api/admin/users - View all users (admin only)`);
        console.log(`\n👤 Default Admin: admin@coinchanger.com / admin123`);
    });
}

start().catch(console.error);
