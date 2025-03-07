const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('环境变量:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '已设置' : '未设置');
console.log('DB_DATABASE:', process.env.DB_DATABASE);

// 创建数据库连接
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

console.log('尝试连接到数据库...');

// 检查用户表
const checkUsers = async () => {
    try {
        // 检查连接
        await new Promise((resolve, reject) => {
            connection.connect((err) => {
                if (err) {
                    console.error('数据库连接失败:', err.message);
                    reject(err);
                } else {
                    console.log('数据库连接成功!');
                    resolve();
                }
            });
        });

        // 查询用户表
        await new Promise((resolve, reject) => {
            connection.query('SELECT * FROM users', (err, results) => {
                if (err) {
                    console.error('查询用户表失败:', err.message);
                    reject(err);
                } else {
                    console.log('用户表数据:');
                    console.log(JSON.stringify(results, null, 2));
                    resolve(results);
                }
            });
        });
        
    } catch (error) {
        console.error('检查用户表失败:', error.message);
    } finally {
        // 关闭连接
        connection.end();
    }
};

// 执行检查
checkUsers(); 