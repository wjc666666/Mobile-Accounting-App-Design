const mysql = require('mysql2');
const path = require('path');
const bcrypt = require('bcrypt');
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

// 修复用户表
const fixUsers = async () => {
    try {
        // 连接数据库
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

        // 查询所有密码哈希值为"hashedpassword"的用户
        const [users] = await connection.promise().query(
            "SELECT * FROM users WHERE password_hash = 'hashedpassword'"
        );
        
        console.log(`找到 ${users.length} 个需要修复的用户`);
        
        // 为每个用户生成新的密码哈希值
        for (const user of users) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await connection.promise().query(
                'UPDATE users SET password_hash = ? WHERE id = ?',
                [hashedPassword, user.id]
            );
            console.log(`已修复用户 ${user.username} (ID: ${user.id}) 的密码哈希值`);
        }
        
        console.log('所有用户密码已修复，新密码为: password123');
        
    } catch (error) {
        console.error('修复用户失败:', error.message);
    } finally {
        // 关闭连接
        connection.end();
    }
};

// 执行修复
fixUsers(); 