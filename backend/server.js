const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ 确保 `.env` 变量正确加载
console.log("✅ Loaded environment variables:");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_DATABASE:", process.env.DB_DATABASE);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Loaded" : "❌ Not Loaded");
console.log("PORT:", process.env.PORT);

// ✅ 连接 MySQL 数据库
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

db.connect(err => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
    } else {
        console.log("✅ Successfully connected to MySQL database!");
    }
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
        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error("❌ Registration failed:", err.message);
                return res.status(500).json({ error: "Failed to register user: " + err.message });
            }
            console.log("✅ User registered:", username);
            res.status(201).json({ message: "User registered successfully!" });
        });
    } catch (error) {
        console.error("❌ Internal server error:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ 用户登录（JWT 认证）
app.post("/users/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error("❌ Database error:", err.message);
            return res.status(500).json({ error: "Database error: " + err.message });
        }

        if (results.length === 0) {
            console.warn("⚠️ Invalid login attempt:", email);
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            console.warn("⚠️ Password mismatch for user:", email);
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // 生成 JWT 令牌
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        console.log("✅ Login successful for:", email);

        res.json({ message: "Login successful!", token });
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
    db.query(sql, [req.userId], (err, results) => {
        if (err) {
            console.error("❌ Database Query Failed:", err.message);
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            console.warn("⚠️ User not found in database, ID:", req.userId);
            return res.status(404).json({ error: "User not found" });
        }

        console.log("✅ User Profile Found:", results[0]);
        res.json(results[0]);
    });
});

// ✅ 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server is running at http://0.0.0.0:${PORT}`));
