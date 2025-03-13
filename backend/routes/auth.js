const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { Pool } = require("pg");
require("dotenv").config();

const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Login route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const userResult = await pool.query("SELECT id, username, password_hash, is_admin FROM users WHERE email = $1",
            [email]
        );
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = userResult.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.id, is_admin: user.is_admin, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        res.json({ message: "Login successful", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Request password reset
router.post("/request-password-reset", async (req, res) => {
    try {
        const { email } = req.body;
        console.log("Received email:", email);
        const userQuery = "SELECT id FROM users WHERE email = $1";
        const userResult = await pool.query(userQuery, [email]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const userId = userResult.rows[0].id;

        // Generate secure reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = await bcrypt.hash(resetToken, 10);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Store token in the database
        const updateQuery = `
            UPDATE users 
            SET reset_password_token = $1, reset_password_expires = $2 
            WHERE id = $3
        `;
        await pool.query(updateQuery,
            [hashedToken, expiresAt, userId]
        );

        // Send email with reset link along with token
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;
        await sendEmail(email, "Password Reset Request", `Click to reset your password: ${resetLink}`);

        res.json({ message: "Password reset email sent!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Reset password
router.post("/reset-password", async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;
        const userQuery = `
            SELECT id, reset_password_token, reset_password_expires 
            FROM users WHERE email = $1
        `;
        const userResult = await pool.query(userQuery,
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: "Invalid or expired reset token" });
        }

        const user = userResult.rows[0];
        if (!user.reset_password_token || user.reset_password_expires < new Date()) {
            return res.status(400).json({ error: "Invalid or expired reset token" });
        }

        // Verify token
        const isMatch = await bcrypt.compare(token, user.reset_password_token);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid reset token" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear reset token
        const updateQuery = `
            UPDATE users 
            SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL 
            WHERE id = $2
        `;
        await pool.query(updateQuery,
            [hashedPassword, user.id]
        );

        res.json({ message: "Password successfully reset!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;