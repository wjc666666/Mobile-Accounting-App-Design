const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 创建不指定数据库的连接
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

console.log('数据库连接配置:');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('Password:', process.env.DB_PASSWORD ? '已设置' : '未设置');

// 初始化数据库
const initDatabase = async () => {
    try {
        // 读取schema.sql文件
        const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        
        // 执行schema.sql中的SQL语句
        console.log('正在创建数据库和表...');
        const schemaSQLStatements = schemaSQL.split(';').filter(statement => statement.trim() !== '');
        
        for (const statement of schemaSQLStatements) {
            await new Promise((resolve, reject) => {
                connection.query(statement, (err) => {
                    if (err) {
                        console.error('执行SQL语句失败:', err.message);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }
        
        console.log('数据库和表创建成功！');
        
        // 切换到新创建的数据库
        await new Promise((resolve, reject) => {
            connection.query('USE mobile_accounting_db', (err) => {
                if (err) {
                    console.error('切换到数据库失败:', err.message);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        
        // 读取init_data.sql文件
        const initDataSQL = fs.readFileSync(path.join(__dirname, 'init_data.sql'), 'utf8');
        
        // 执行init_data.sql中的SQL语句
        console.log('正在初始化数据...');
        const initDataSQLStatements = initDataSQL.split(';').filter(statement => statement.trim() !== '');
        
        for (const statement of initDataSQLStatements) {
            await new Promise((resolve, reject) => {
                connection.query(statement, (err) => {
                    if (err) {
                        console.error('执行SQL语句失败:', err.message);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }
        
        console.log('数据初始化成功！');
        
    } catch (error) {
        console.error('初始化数据库失败:', error.message);
    } finally {
        // 关闭连接
        connection.end();
    }
};

// 执行初始化
initDatabase(); 