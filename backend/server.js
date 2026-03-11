const adminRoutes = require("./routes/adminRoutes");
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

/* TEST DATABASE */
app.get("/rooms", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM room_types");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.get("/maintenance", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM maintenance_items ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("MAINTENANCE ERROR:", err.message);
    res.status(500).send("Database error");
  }
});

app.get("/promotions", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM promotion_types ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("PROMOTIONS ERROR:", err.message);
    res.status(500).send("Database error");
  }
});

app.post("/player-signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
    }

    const emailNorm = email.trim().toLowerCase();

    console.log("RAW BODY:", req.body);
    console.log("EMAIL NORM:", emailNorm);

    const existing = await pool.query(
      "SELECT id, email FROM users WHERE email = $1",
      [emailNorm]
    );

    console.log("EXISTING ROWS:", existing.rows);

    const result = await pool.query(
      `INSERT INTO users 
      (email, username, password_hash, system_role, is_active)
      VALUES ($1, $2, $3, 'player', true)
      RETURNING id, username, email`,
      [emailNorm, username.trim(), password]
    );

    res.json({
      message: "Signup successful",
      player: result.rows[0],
    });
  } catch (err) {
    console.error("SIGNUP ERROR FULL:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/player-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "กรุณากรอกอีเมลและรหัสผ่าน" });
    }

    const emailNorm = email.trim().toLowerCase();

    const result = await pool.query(
      `SELECT id, username, email, password_hash
       FROM users
       WHERE email = $1 AND is_active = true`,
      [emailNorm]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "ไม่พบบัญชีนี้" });
    }

    const user = result.rows[0];

    if (user.password_hash !== password) {
      return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
    }

    res.json({
      message: "Login successful",
      player: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});