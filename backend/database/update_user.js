const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 创建数据库连接
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

console.log('数据库连接配置:');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('Password:', process.env.DB_PASSWORD ? '已设置' : '未设置');
console.log('Database:', process.env.DB_DATABASE);

// 更新用户表
const updateUser = async () => {
    try {
        // 先删除测试用户
        await new Promise((resolve, reject) => {
            connection.query('DELETE FROM users WHERE email = ?', ['test@example.com'], (err, results) => {
                if (err) {
                    console.error('删除用户失败:', err.message);
                    reject(err);
                } else {
                    console.log('已删除旧的测试用户');
                    resolve(results);
                }
            });
        });

        // 插入新的测试用户
        const sql = `INSERT INTO users (username, email, password_hash) 
                     VALUES ('testuser', 'test@example.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9wVsruQQr.K8GQSbpZMfLWokN/C9Pnm')`;
        
        await new Promise((resolve, reject) => {
            connection.query(sql, (err, results) => {
                if (err) {
                    console.error('插入用户失败:', err.message);
                    reject(err);
                } else {
                    console.log('测试用户已更新，密码为: password123');
                    resolve(results);
                }
            });
        });
        
    } catch (error) {
        console.error('更新用户失败:', error.message);
    } finally {
        // 关闭连接
        connection.end();
    }
};

// 执行更新
updateUser(); 