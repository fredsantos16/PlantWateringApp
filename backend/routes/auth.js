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

        const accessToken = jwt.sign(
            { userId: user.id, is_admin: user.is_admin, username: user.username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
        );

        const refreshToken = jwt.sign(
            { userId: user.id, is_admin: user.is_admin, username: user.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
        )

        await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2",
            [refreshToken, user.id]
        );

        res.json({ message: "Login successful", accessToken, refreshToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Refresh token route
router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token required" });
    }

    try {
        // Verify token before fetching it
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Search user by id and token
        const userResult = await pool.query(
            "SELECT id, is_admin, username FROM users WHERE id = $1 AND refresh_token = $2",
            [decoded.userId, refreshToken]
        );

        if (userResult.rows.length === 0) {
            return res.status(403).json({ error: "Invalid refresh token" });
        }

        const user = userResult.rows[0];

        // Generate new tokens
        const newAccessToken = jwt.sign(
            { userId: user.id, is_admin: user.is_admin, username: user.username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
        );

        const newRefreshToken = jwt.sign(
            { userId: user.id, is_admin: user.is_admin, username: user.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
        );

        // Update tokens in database
        await pool.query(
            "UPDATE users SET refresh_token = $1 WHERE id = $2",
            [newRefreshToken, user.id]
        );

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });

    } catch (error) {
        console.error(error);
        res.status(403).json({ error: "Invalid or expired refresh token" });
    }
});



// Logout route
router.post('/logout', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });

    try {
        // Check if refresh token exists
        const userResult = await pool.query(
            "SELECT id FROM users WHERE refresh_token = $1",
            [refreshToken]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: "Invalid refresh token" });
        }

        await pool.query(
            "UPDATE users SET refresh_token = NULL WHERE refresh_token = $1",
            [refreshToken]
        );

        res.json({ message: "Logged out successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});





// Request password reset
router.post("/request-password-reset", async (req, res) => {
    try {
        const { email } = req.body;
        console.log("Received email:", email);
        const userResult = await pool.query("SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const userId = userResult.rows[0].id;

        // Generate secure reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = await bcrypt.hash(resetToken, 10);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Store token in the database
        await pool.query("UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3",
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
        const userResult = await pool.query("SELECT id, reset_password_token, reset_password_expires FROM users WHERE email = $1",
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
        await pool.query("UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2",
            [hashedPassword, user.id]
        );

        res.json({ message: "Password successfully reset!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;