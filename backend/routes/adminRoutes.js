const express = require("express");
const router = express.Router();

const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authAdmin = require("../middleware/authAdmin");

/*
  Admin Routes
*/

/* =========================
   Verify Admin Code
   ========================= */

router.post("/verify-code", async (req, res) => {

  try {

    const { code } = req.body;

    const result = await pool.query(
      `
      SELECT *
      FROM admin_access_codes
      WHERE code = $1
      AND is_active = true
      AND used_by_user_id IS NULL
      `,
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid or used admin code"
      });
    }

    res.json({
      success: true
    });

  } catch (error) {

    console.error("verify-code error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

});

/* =========================
   Admin Signup
   ========================= */

router.post("/signup", async (req, res) => {

  try {

    const { email, password, code } = req.body;

    if (!email || !password || !code) {
      return res.status(400).json({
        message: "Email, password และ code จำเป็นต้องกรอก"
      });
    }

    const emailNorm = email.trim().toLowerCase();

    // ตรวจสอบ code อีกครั้ง
    const codeCheck = await pool.query(
      `
      SELECT *
      FROM admin_access_codes
      WHERE code = $1
      AND is_active = true
      AND used_by_user_id IS NULL
      `,
      [code]
    );

    if (codeCheck.rows.length === 0) {
      return res.status(400).json({
        message: "Admin code ไม่ถูกต้อง หรือถูกใช้แล้ว"
      });
    }

    // ตรวจสอบ email ซ้ำ
    const existing = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [emailNorm]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "Email นี้ถูกใช้แล้ว"
      });
    }

    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // สร้าง admin user
    const result = await pool.query(
      `
      INSERT INTO users
      (email, password_hash, system_role, is_active)
      VALUES ($1, $2, 'admin', true)
      RETURNING id, email
      `,
      [emailNorm, passwordHash]
    );

    const userId = result.rows[0].id;

    // mark code ว่าใช้แล้ว
    await pool.query(
      `
      UPDATE admin_access_codes
      SET used_by_user_id = $1,
          used_at = NOW()
      WHERE code = $2
      `,
      [userId, code]
    );

    res.json({
      message: "Admin account created",
      admin: result.rows[0]
    });

  } catch (error) {

    console.error("admin signup error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

});

/* =========================
   Admin Login
   ========================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email และ password จำเป็นต้องกรอก"
      });
    }

    const emailNorm = email.trim().toLowerCase();

    const result = await pool.query(
      `
      SELECT id, email, username, password_hash, system_role, is_active
      FROM users
      WHERE email = $1
      `,
      [emailNorm]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "ไม่พบบัญชีนี้"
      });
    }

    const user = result.rows[0];

    if (user.system_role !== "admin") {
      return res.status(403).json({
        message: "บัญชีนี้ไม่ใช่ admin"
      });
    }

    if (user.is_active !== true) {
      return res.status(403).json({
        message: "บัญชีนี้ถูกปิดใช้งาน"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: "รหัสผ่านไม่ถูกต้อง"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        system_role: user.system_role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Admin login successful",
      token,
      admin: {
        id: user.id,
        email: user.email,
        username: user.username,
        system_role: user.system_role
      }
    });

  } catch (error) {
    console.error("admin login error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
});

/* =========================
   Get Current Admin
   ========================= */

router.get("/me", authAdmin, async (req, res) => {
  try {
    const adminId = req.admin.id;

    const result = await pool.query(
      `
      SELECT id, email, username, system_role, is_active
      FROM users
      WHERE id = $1
      `,
      [adminId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Admin not found"
      });
    }

    res.json({
      admin: result.rows[0]
    });

  } catch (error) {
    console.error("admin /me error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router;