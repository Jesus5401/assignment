const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin123', // 替换为你的 MySQL 密码
    database: 'contact_management',
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('MySQL Connected...');
});

module.exports = db;


