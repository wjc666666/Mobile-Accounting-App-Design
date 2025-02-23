const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// 连接数据库
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

db.connect(err => {
    if (err) {
        console.error("❌ Database connection failed: " + err.message);
    } else {
        console.log("✅ Successfully connected to MySQL database!");
    }
});

// 用户注册 API（支持密码加密）
app.post("/users/register", async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) return res.status(500).json({ error: "Failed to register user: " + err.message });
            res.status(201).json({ message: "User registered successfully!" });
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// 用户登录 API（使用 JWT）
app.post("/users/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Database error: " + err.message });

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // 生成 JWT 令牌
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login successful!", token });
    });
});

// 保护 API（中间件）
const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Unauthorized access" });
        }
        req.userId = decoded.userId;
        next();
    });
};

// 获取用户信息（需要 JWT 认证）
app.get("/users/profile", verifyToken, (req, res) => {
    const sql = "SELECT id, username, email FROM users WHERE id = ?";
    db.query(sql, [req.userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});

// 获取收入（需要 JWT 认证）
app.get("/income", verifyToken, (req, res) => {
    const sql = "SELECT * FROM income WHERE user_id = ?";
    db.query(sql, [req.userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 获取支出（需要 JWT 认证）
app.get("/expenses", verifyToken, (req, res) => {
    const sql = "SELECT * FROM expenses WHERE user_id = ?";
    db.query(sql, [req.userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 记录收入（需要 JWT 认证）
app.post("/income", verifyToken, (req, res) => {
    const { amount, category, date } = req.body;

    if (!amount || !category || !date) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = "INSERT INTO income (user_id, amount, category, date) VALUES (?, ?, ?, ?)";
    db.query(sql, [req.userId, amount, category, date], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Income added successfully!" });
    });
});

// 记录支出（需要 JWT 认证）
app.post("/expenses", verifyToken, (req, res) => {
    const { amount, category, date } = req.body;

    if (!amount || !category || !date) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = "INSERT INTO expenses (user_id, amount, category, date) VALUES (?, ?, ?, ?)";
    db.query(sql, [req.userId, amount, category, date], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Expense added successfully!" });
    });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server is running at http://localhost:${PORT}`));
