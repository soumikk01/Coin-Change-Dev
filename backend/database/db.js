const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'coinchanger.db');
let db = null;

// Initialize database
async function initDB() {
    const SQL = await initSqlJs();

    // Load existing database or create new one
    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
        console.log('📂 Loaded existing database');
    } else {
        db = new SQL.Database();
        console.log('📂 Created new database');
    }

    // Create users table
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Create calculations table
    db.run(`
    CREATE TABLE IF NOT EXISTS calculations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      amount INTEGER NOT NULL,
      coins TEXT NOT NULL,
      result TEXT NOT NULL,
      min_coins INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

    // Create default admin if not exists
    const adminResult = db.exec("SELECT id FROM users WHERE email = 'admin@coinchanger.com'");
    if (adminResult.length === 0) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        db.run(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['Admin', 'admin@coinchanger.com', hashedPassword, 'admin']
        );
        console.log('✅ Default admin created: admin@coinchanger.com / admin123');
    }

    saveDB();
    console.log('✅ Database initialized successfully');
}

// Save database to file
function saveDB() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    }
}

// User operations
const userDB = {
    // Create new user
    create: (name, email, hashedPassword) => {
        db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
        const result = db.exec('SELECT last_insert_rowid() as id');
        saveDB();
        return result[0].values[0][0];
    },

    // Find user by email
    findByEmail: (email) => {
        const result = db.exec('SELECT * FROM users WHERE email = ?', [email]);
        if (result.length === 0 || result[0].values.length === 0) return null;
        const row = result[0].values[0];
        return {
            id: row[0],
            name: row[1],
            email: row[2],
            password: row[3],
            role: row[4],
            created_at: row[5]
        };
    },

    // Find user by id
    findById: (id) => {
        const result = db.exec('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
        if (result.length === 0 || result[0].values.length === 0) return null;
        const row = result[0].values[0];
        return {
            id: row[0],
            name: row[1],
            email: row[2],
            role: row[3],
            created_at: row[4]
        };
    },

    // Get all users (for admin)
    getAll: () => {
        const result = db.exec('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
        if (result.length === 0) return [];
        return result[0].values.map(row => ({
            id: row[0],
            name: row[1],
            email: row[2],
            role: row[3],
            created_at: row[4]
        }));
    },

    // Count users
    count: () => {
        const result = db.exec('SELECT COUNT(*) as count FROM users');
        return result[0].values[0][0];
    }
};

// Calculations operations
const calculationsDB = {
    // Save a calculation
    save: (userId, userName, userEmail, amount, coins, result, minCoins) => {
        db.run(
            'INSERT INTO calculations (user_id, user_name, user_email, amount, coins, result, min_coins) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, userName, userEmail, amount, JSON.stringify(coins), JSON.stringify(result), minCoins]
        );
        const insertResult = db.exec('SELECT last_insert_rowid() as id');
        saveDB();
        return insertResult[0].values[0][0];
    },

    // Get all calculations (for admin)
    getAll: () => {
        const result = db.exec('SELECT id, user_id, user_name, user_email, amount, coins, result, min_coins, created_at FROM calculations ORDER BY created_at DESC');
        if (result.length === 0) return [];
        return result[0].values.map(row => ({
            id: row[0],
            user_id: row[1],
            user_name: row[2],
            user_email: row[3],
            amount: row[4],
            coins: JSON.parse(row[5]),
            result: JSON.parse(row[6]),
            min_coins: row[7],
            created_at: row[8]
        }));
    },

    // Get calculations by user
    getByUser: (userId) => {
        const result = db.exec('SELECT id, amount, coins, result, min_coins, created_at FROM calculations WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        if (result.length === 0) return [];
        return result[0].values.map(row => ({
            id: row[0],
            amount: row[1],
            coins: JSON.parse(row[2]),
            result: JSON.parse(row[3]),
            min_coins: row[4],
            created_at: row[5]
        }));
    },

    // Count calculations
    count: () => {
        const result = db.exec('SELECT COUNT(*) as count FROM calculations');
        return result[0].values[0][0];
    }
};

module.exports = { initDB, userDB, calculationsDB, saveDB };

