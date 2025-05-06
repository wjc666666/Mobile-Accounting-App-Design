const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

// 导入数据库模块
const { db, connectDB, query } = require("./database/db");

const app = express();
app.use(cors());
app.use(express.json());

// 添加根路由
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Mobile Accounting API', status: 'online' });
});

// 添加健康检查端点
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ✅ 确保 `.env` 变量正确加载
console.log("✅ Loaded environment variables:");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_DATABASE:", process.env.DB_DATABASE);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Loaded" : "❌ Not Loaded");
console.log("PORT:", process.env.PORT);

// 连接数据库
connectDB()
    .then(() => {
        // 启动服务器
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`✅ Server is running at http://0.0.0.0:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Database connection failed:", err.message);
    });

// ✅ 用户注册（密码加密）
app.post("/users/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
        
        const result = await query(sql, [username, email, hashedPassword]);
        console.log("✅ User registered:", username);
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("❌ Registration failed:", error.message);
        res.status(500).json({ error: "Failed to register user: " + error.message });
    }
});

// ✅ 用户登录（JWT 认证）
app.post("/users/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("🔍 Login attempt for email:", email);

    const sql = "SELECT * FROM users WHERE email = ?";
    query(sql, [email])
        .then((results) => {
            console.log("🔍 Query results:", JSON.stringify(results));
            
            if (!results || results.length === 0) {
                console.warn("⚠️ Invalid login attempt, user not found:", email);
                return res.status(401).json({ error: "Invalid email or password" });
            }

            const user = results[0];
            console.log("🔍 User found:", JSON.stringify({
                id: user.id,
                username: user.username,
                email: user.email,
                password_hash_exists: !!user.password_hash
            }));

            if (!user.password_hash) {
                console.error("❌ User has no password_hash:", email);
                return res.status(500).json({ error: "User account is not properly set up" });
            }

            bcrypt.compare(password, user.password_hash)
                .then((isMatch) => {
                    if (!isMatch) {
                        console.warn("⚠️ Password mismatch for user:", email);
                        return res.status(401).json({ error: "Invalid email or password" });
                    }

                    // 生成 JWT 令牌
                    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
                    console.log("✅ Login successful for:", email);

                    res.json({ message: "Login successful!", token });
                })
                .catch((err) => {
                    console.error("❌ Password comparison failed:", err.message);
                    res.status(500).json({ error: "Failed to compare passwords" });
                });
        })
        .catch((err) => {
            console.error("❌ Database error:", err.message);
            res.status(500).json({ error: "Database error: " + err.message });
        });
});

// ✅ 保护 API（JWT 认证中间件）
const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    console.log("🛠️ Received Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.warn("⚠️ No valid token provided");
        return res.status(403).json({ error: "No valid token provided" });
    }

    const token = authHeader.split(" ")[1];

    console.log("🛠️ Extracted Token:", token);
    console.log("🛠️ Expected JWT_SECRET:", process.env.JWT_SECRET);

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("❌ JWT Verification Failed:", err.message);
            return res.status(401).json({ error: "Unauthorized access, invalid token" });
        }
        console.log("✅ Token Verified, User ID:", decoded.userId);
        req.userId = decoded.userId;
        next();
    });
};

// ✅ 获取用户信息（需要 JWT 认证）
app.get("/users/profile", verifyToken, (req, res) => {
    const sql = "SELECT id, username, email FROM users WHERE id = ?";
    query(sql, [req.userId])
        .then(([results]) => {
            if (results.length === 0) {
                console.warn("⚠️ User not found in database, ID:", req.userId);
                return res.status(404).json({ error: "User not found" });
            }

            console.log("✅ User Profile Found:", results[0]);
            res.json(results[0]);
        })
        .catch((err) => {
            console.error("❌ Database Query Failed:", err.message);
            res.status(500).json({ error: err.message });
        });
});

// ✅ 添加收入记录
app.post("/income", verifyToken, (req, res) => {
    const { amount, category, date, description } = req.body;
    
    if (!amount || !category || !date) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    const sql = "INSERT INTO income (user_id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)";
    query(sql, [req.userId, amount, category, date, description])
        .then((result) => {
            console.log("✅ Income added for user:", req.userId);
            res.status(201).json({ 
                message: "Income added successfully!",
                id: result.insertId
            });
        })
        .catch((err) => {
            console.error("❌ Failed to add income:", err.message);
            res.status(500).json({ error: "Failed to add income: " + err.message });
        });
});

// ✅ 获取收入记录
app.get("/income", verifyToken, (req, res) => {
    const sql = "SELECT * FROM income WHERE user_id = ? ORDER BY date DESC";
    query(sql, [req.userId])
        .then((results) => {
            // 确保results是一个数组
            const incomeRecords = Array.isArray(results) ? results : [];
            console.log(`✅ Retrieved ${incomeRecords.length} income records for user:`, req.userId);
            res.json(incomeRecords);
        })
        .catch((err) => {
            console.error("❌ Failed to get income records:", err.message);
            res.status(500).json({ error: "Failed to get income records: " + err.message });
        });
});

// ✅ 添加支出记录
app.post("/expenses", verifyToken, (req, res) => {
    const { amount, category, date, description } = req.body;
    
    if (!amount || !category || !date) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    const sql = "INSERT INTO expenses (user_id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)";
    query(sql, [req.userId, amount, category, date, description])
        .then((result) => {
            console.log("✅ Expense added for user:", req.userId);
            res.status(201).json({ 
                message: "Expense added successfully!",
                id: result.insertId
            });
        })
        .catch((err) => {
            console.error("❌ Failed to add expense:", err.message);
            res.status(500).json({ error: "Failed to add expense: " + err.message });
        });
});

// ✅ 获取支出记录
app.get("/expenses", verifyToken, (req, res) => {
    const sql = "SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC";
    query(sql, [req.userId])
        .then((results) => {
            // 确保results是一个数组
            const expenseRecords = Array.isArray(results) ? results : [];
            console.log(`✅ Retrieved ${expenseRecords.length} expense records for user:`, req.userId);
            res.json(expenseRecords);
        })
        .catch((err) => {
            console.error("❌ Failed to get expense records:", err.message);
            res.status(500).json({ error: "Failed to get expense records: " + err.message });
        });
});

// ✅ 获取预算分析
app.get("/budget/analysis", verifyToken, (req, res) => {
    // 获取当前月份的第一天和最后一天
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    // 获取当月收入总额
    const incomeQuery = "SELECT SUM(amount) as total_income FROM income WHERE user_id = ? AND date BETWEEN ? AND ?";
    
    // 获取当月支出总额和各类别支出
    const expenseQuery = "SELECT SUM(amount) as total_expense FROM expenses WHERE user_id = ? AND date BETWEEN ? AND ?";
    const categoryQuery = "SELECT category, SUM(amount) as amount FROM expenses WHERE user_id = ? AND date BETWEEN ? AND ? GROUP BY category";
    
    // 执行收入查询
    query(incomeQuery, [req.userId, firstDay, lastDay])
        .then((incomeResults) => {
            // 确保incomeResults是一个数组
            const totalIncome = incomeResults && incomeResults[0] && incomeResults[0].total_income ? 
                Number(incomeResults[0].total_income) : 0;
            
            // 执行支出查询
            query(expenseQuery, [req.userId, firstDay, lastDay])
                .then((expenseResults) => {
                    // 确保expenseResults是一个数组
                    const totalExpense = expenseResults && expenseResults[0] && expenseResults[0].total_expense ? 
                        Number(expenseResults[0].total_expense) : 0;
                    
                    // 执行类别查询
                    query(categoryQuery, [req.userId, firstDay, lastDay])
                        .then((categoryResults) => {
                            // 确保categoryResults是一个数组
                            const categoryData = Array.isArray(categoryResults) ? categoryResults : [];
                            
                            // 计算余额和节省率
                            const balance = totalIncome - totalExpense;
                            const savingRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
                            
                            // 构建分析结果
                            const analysis = {
                                period: {
                                    start: firstDay,
                                    end: lastDay
                                },
                                summary: {
                                    totalIncome,
                                    totalExpense,
                                    balance,
                                    savingRate: parseFloat(savingRate.toFixed(2))
                                },
                                categories: categoryData || []
                            };
                            
                            console.log("✅ Budget analysis generated for user:", req.userId);
                            res.json(analysis);
                        })
                        .catch((err) => {
                            console.error("❌ Failed to get category analysis:", err.message);
                            res.status(500).json({ error: "Failed to get budget analysis: " + err.message });
                        });
                })
                .catch((err) => {
                    console.error("❌ Failed to get expense analysis:", err.message);
                    res.status(500).json({ error: "Failed to get budget analysis: " + err.message });
                });
        })
        .catch((err) => {
            console.error("❌ Failed to get income analysis:", err.message);
            res.status(500).json({ error: "Failed to get budget analysis: " + err.message });
        });
});

// Import API - Handle imported transactions from payment platforms
app.post('/api/import', verifyToken, async (req, res) => {
    try {
        const { transactions } = req.body;
        const userId = req.userId;
        
        console.log(`📥 Received ${transactions.length} imported transactions for user ${userId}`);
        
        // Validate transactions array
        if (!Array.isArray(transactions) || transactions.length === 0) {
            return res.status(400).json({ error: "Invalid transactions data format" });
        }

        // Process transactions based on type (income or expense)
        const incomeTransactions = transactions.filter(t => t.type === 'income');
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        
        // Process income transactions
        if (incomeTransactions.length > 0) {
            const incomeValues = incomeTransactions.map(t => {
                return [
                    userId,
                    t.amount,
                    t.category,
                    t.date,
                    t.description,
                    `Imported from ${t.source}`
                ];
            });
            
            const incomeQuery = `
                INSERT INTO income (user_id, amount, category, date, description, notes)
                VALUES ?
            `;
            
            await db.query(incomeQuery, [incomeValues]);
        }
        
        // Process expense transactions
        if (expenseTransactions.length > 0) {
            const expenseValues = expenseTransactions.map(t => {
                return [
                    userId,
                    t.amount,
                    t.category,
                    t.date,
                    t.description,
                    `Imported from ${t.source}`
                ];
            });
            
            const expenseQuery = `
                INSERT INTO expenses (user_id, amount, category, date, description, notes)
                VALUES ?
            `;
            
            await db.query(expenseQuery, [expenseValues]);
        }
        
        console.log(`✅ Successfully imported ${incomeTransactions.length} income and ${expenseTransactions.length} expense transactions`);
        
        res.status(200).json({ 
            success: true,
            message: `Successfully imported ${transactions.length} transactions`,
            summary: {
                income: incomeTransactions.length,
                incomeTotal: incomeTransactions.reduce((sum, t) => sum + t.amount, 0),
                expense: expenseTransactions.length,
                expenseTotal: expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
            }
        });
    } catch (err) {
        console.error("❌ Error importing transactions:", err);
        res.status(500).json({ error: "Failed to import transactions", details: err.message });
    }
});

// ✅ 删除收入记录
app.delete("/income/:id", verifyToken, (req, res) => {
    const incomeId = req.params.id;
    const sql = "DELETE FROM income WHERE id = ? AND user_id = ?";
    
    query(sql, [incomeId, req.userId])
        .then((result) => {
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Income record not found or unauthorized" });
            }
            console.log("✅ Income deleted for user:", req.userId);
            res.json({ message: "Income deleted successfully!" });
        })
        .catch((err) => {
            console.error("❌ Failed to delete income:", err.message);
            res.status(500).json({ error: "Failed to delete income: " + err.message });
        });
});

// ✅ 删除支出记录
app.delete("/expenses/:id", verifyToken, (req, res) => {
    const expenseId = req.params.id;
    const sql = "DELETE FROM expenses WHERE id = ? AND user_id = ?";
    
    query(sql, [expenseId, req.userId])
        .then((result) => {
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Expense record not found or unauthorized" });
            }
            console.log("✅ Expense deleted for user:", req.userId);
            res.json({ message: "Expense deleted successfully!" });
        })
        .catch((err) => {
            console.error("❌ Failed to delete expense:", err.message);
            res.status(500).json({ error: "Failed to delete expense: " + err.message });
        });
});

// ✅ 更新收入记录
app.put("/income/:id", verifyToken, (req, res) => {
    const incomeId = req.params.id;
    const { amount, category, date, description } = req.body;
    
    if (!amount || !category || !date) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    const sql = "UPDATE income SET amount = ?, category = ?, date = ?, description = ? WHERE id = ? AND user_id = ?";
    query(sql, [amount, category, date, description, incomeId, req.userId])
        .then((result) => {
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Income record not found or unauthorized" });
            }
            console.log("✅ Income updated for user:", req.userId);
            res.json({ message: "Income updated successfully!" });
        })
        .catch((err) => {
            console.error("❌ Failed to update income:", err.message);
            res.status(500).json({ error: "Failed to update income: " + err.message });
        });
});

// ✅ 更新支出记录
app.put("/expenses/:id", verifyToken, (req, res) => {
    const expenseId = req.params.id;
    const { amount, category, date, description } = req.body;
    
    if (!amount || !category || !date) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    const sql = "UPDATE expenses SET amount = ?, category = ?, date = ?, description = ? WHERE id = ? AND user_id = ?";
    query(sql, [amount, category, date, description, expenseId, req.userId])
        .then((result) => {
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Expense record not found or unauthorized" });
            }
            console.log("✅ Expense updated for user:", req.userId);
            res.json({ message: "Expense updated successfully!" });
        })
        .catch((err) => {
            console.error("❌ Failed to update expense:", err.message);
            res.status(500).json({ error: "Failed to update expense: " + err.message });
        });
});

// ✅ 获取用户的所有财务目标
app.get("/goals", verifyToken, (req, res) => {
    console.log("✅ Token Verified, User:", req.userId);
    const sql = "SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC";
    
    query(sql, [req.userId])
        .then((results) => {
            // 转换数值类型确保前端接收到的是数字而不是字符串
            const goals = results.map(goal => {
                return {
                    ...goal,
                    targetAmount: parseFloat(goal.target_amount) || 0,
                    currentAmount: parseFloat(goal.current_amount) || 0,
                    deadline: goal.deadline,
                    status: goal.status || 'active'
                };
            });
            console.log("Goals retrieved:", goals.length);
            res.json(goals);
        })
        .catch((err) => {
            console.error("Error retrieving goals:", err);
            res.status(500).json({ error: "Failed to retrieve goals" });
        });
});

// 添加新的财务目标
app.post("/goals", verifyToken, (req, res) => {
    console.log("✅ Adding goal for user:", req.userId);
    console.log("Goal data:", req.body);
    
    const { name, targetAmount, currentAmount, deadline, description, status } = req.body;
    
    if (!name || targetAmount === undefined || targetAmount === null) {
        return res.status(400).json({ error: "Name and target amount are required" });
    }
    
    // 处理日期格式，将ISO字符串转换为YYYY-MM-DD格式
    let formattedDeadline = null;
    if (deadline) {
        try {
            // 尝试转换日期格式
            const dateObj = new Date(deadline);
            if (!isNaN(dateObj.getTime())) {
                formattedDeadline = dateObj.toISOString().split('T')[0];
                console.log("Formatted deadline:", formattedDeadline);
            } else {
                console.error("Invalid date format:", deadline);
            }
        } catch (err) {
            console.error("Error formatting date:", err);
        }
    }
    
    const sql = "INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const params = [
        req.userId, 
        name, 
        parseFloat(targetAmount) || 0, 
        parseFloat(currentAmount) || 0, 
        formattedDeadline, 
        description || "", 
        status || "active"
    ];
    
    console.log("SQL params:", params);
    
    query(sql, params)
        .then((result) => {
            console.log("Goal added:", result.insertId);
            res.status(201).json({ 
                id: result.insertId,
                message: "Goal added successfully" 
            });
        })
        .catch((err) => {
            console.error("Error adding goal:", err);
            res.status(500).json({ error: "Failed to add goal" });
        });
});

// 更新财务目标
app.put("/goals/:id", verifyToken, (req, res) => {
    const goalId = req.params.id;
    const { name, targetAmount, currentAmount, deadline, description, status } = req.body;
    
    console.log("✅ Updating goal for user:", req.userId);
    console.log("Goal data:", req.body);
    
    if (!goalId) {
        return res.status(400).json({ error: "Goal ID is required" });
    }
    
    // 处理日期格式，将ISO字符串转换为YYYY-MM-DD格式
    let formattedDeadline = null;
    if (deadline) {
        try {
            // 尝试转换日期格式
            const dateObj = new Date(deadline);
            if (!isNaN(dateObj.getTime())) {
                formattedDeadline = dateObj.toISOString().split('T')[0];
                console.log("Formatted deadline:", formattedDeadline);
            } else {
                console.error("Invalid date format:", deadline);
            }
        } catch (err) {
            console.error("Error formatting date:", err);
        }
    }
    
    const sql = "UPDATE goals SET name = ?, target_amount = ?, current_amount = ?, deadline = ?, description = ?, status = ? WHERE id = ? AND user_id = ?";
    const params = [
        name || "", 
        parseFloat(targetAmount) || 0, 
        parseFloat(currentAmount) || 0, 
        formattedDeadline, 
        description || "", 
        status || "active", 
        goalId, 
        req.userId
    ];
    
    console.log("SQL params for update:", params);
    
    query(sql, params)
        .then((result) => {
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Goal not found or unauthorized" });
            }
            console.log("Goal updated successfully");
            res.json({ message: "Goal updated successfully" });
        })
        .catch((err) => {
            console.error("Error updating goal:", err);
            res.status(500).json({ error: "Failed to update goal" });
        });
});

// ✅ 删除财务目标
app.delete("/goals/:id", verifyToken, (req, res) => {
    const goalId = req.params.id;
    const sql = "DELETE FROM goals WHERE id = ? AND user_id = ?";
    
    query(sql, [goalId, req.userId])
        .then((result) => {
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Financial goal not found or unauthorized" });
            }
            console.log("✅ Financial goal deleted for user:", req.userId);
            res.json({ message: "Financial goal deleted successfully!" });
        })
        .catch((err) => {
            console.error("❌ Failed to delete financial goal:", err.message);
            res.status(500).json({ error: "Failed to delete financial goal: " + err.message });
        });
});
