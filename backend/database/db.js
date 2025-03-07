const mysql = require("mysql2");
require("dotenv").config();

// 创建数据库连接
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

// 连接数据库
const connectDB = () => {
    return new Promise((resolve, reject) => {
        db.connect(err => {
            if (err) {
                console.error("❌ Database connection failed:", err.message);
                reject(err);
            } else {
                console.log("✅ Successfully connected to MySQL database!");
                
                // 检查income表中是否存在description字段
                const checkIncomeColumnSql = "SHOW COLUMNS FROM income LIKE 'description'";
                db.query(checkIncomeColumnSql, (err, result) => {
                    if (err) {
                        console.error("❌ Failed to check income table structure:", err.message);
                    } else if (result.length === 0) {
                        // 如果字段不存在，则添加
                        const alterIncomeSql = "ALTER TABLE income ADD COLUMN description TEXT";
                        db.query(alterIncomeSql, (err, result) => {
                            if (err) {
                                console.error("❌ Failed to alter income table:", err.message);
                            } else {
                                console.log("✅ Added description field to income table");
                            }
                        });
                    } else {
                        console.log("✅ Description field already exists in income table");
                    }
                });
                
                // 检查expenses表中是否存在description字段
                const checkExpensesColumnSql = "SHOW COLUMNS FROM expenses LIKE 'description'";
                db.query(checkExpensesColumnSql, (err, result) => {
                    if (err) {
                        console.error("❌ Failed to check expenses table structure:", err.message);
                    } else if (result.length === 0) {
                        // 如果字段不存在，则添加
                        const alterExpensesSql = "ALTER TABLE expenses ADD COLUMN description TEXT";
                        db.query(alterExpensesSql, (err, result) => {
                            if (err) {
                                console.error("❌ Failed to alter expenses table:", err.message);
                            } else {
                                console.log("✅ Added description field to expenses table");
                            }
                        });
                    } else {
                        console.log("✅ Description field already exists in expenses table");
                    }
                });
                
                resolve();
            }
        });
    });
};

// 执行SQL查询的Promise包装
const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

module.exports = {
    db,
    connectDB,
    query
}; 