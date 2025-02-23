const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config(); // Load .env file

const app = express();
app.use(cors());
app.use(express.json());

// Connect to the database using .env configuration
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

// User registration API
app.post("/users/register", (req, res) => {
    const { username, email, password } = req.body;
    const sql = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
    
    db.query(sql, [username, email, password], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "User registered successfully!" });
    });
});

// Get income data API
app.get("/income", (req, res) => {
    const sql = "SELECT * FROM income";
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get expense data API
app.get("/expenses", (req, res) => {
    const sql = "SELECT * FROM expenses";
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server is running at http://localhost:${PORT}`));
