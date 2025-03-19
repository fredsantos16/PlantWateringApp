const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const authenticateUser = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");

// Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create a new user
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const is_admin = false; // Defaults user to a refular user and not an admin
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query("INSERT INTO users (username, email, password_hash, is_admin) VALUES ($1, $2, $3, $4) RETURNING *",
            [username, email, hashedPassword, is_admin]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error creating user" });
    }
});

// Get all users
router.get("/", authenticateUser, requireAdmin, async (req, res) => {
    if (!req.user.is_admin){
        return res.status(403).json({ error: "Access denied."})
    }

    try {
        const result = await pool.query("SELECT id, username, email FROM users");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching users"});
    }
});

// Get a user by id
router.get("/profile", authenticateUser, async (req, res) => {
    const userId = req.user.userId;
    console.log("User ID from Token:", userId);
    try {
        const result = await pool.query("SELECT id, username, email FROM users WHERE id = $1",
            [userId]
        );
        if (result.rows.length === 0){
            return res.status(404).json({ error: "User not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching user" });
    }
});

// Delete a user by id
router.delete("/:id", authenticateUser, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: "User not found" });
        res.json({ message: "User deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error deleting user" });
    }
});

// Update user profile information by id
router.put("/:id", authenticateUser, async (req, res) => {
    const { id } = req.params;
    const { username, email } = req.body;

    // Regular expression for validating email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    try {
        // Ensure username and email are not null or empty
        if (!username || username.trim() === "") {
            return res.status(400).json({ error: "Username cannot be empty" });
        }

        if (!email || email.trim() === "") {
            return res.status(400).json({ error: "Email cannot be empty" });
        }

        // Validate email format
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Fetch the current user data
        const userResult = await pool.query(
            "SELECT username, email FROM users WHERE id = $1",
            [id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const currentUser = userResult.rows[0];

        // Check if both username and email are unchanged
        if (username === currentUser.username && email === currentUser.email) {
            return res.status(400).json({ error: "No changes detected" });
        }

        // Check if the new username is already taken by another user
        if (username !== currentUser.username) {
            const usernameCheck = await pool.query(
                "SELECT id FROM users WHERE username = $1 AND id != $2",
                [username, id]
            );

            if (usernameCheck.rows.length > 0) {
                return res.status(400).json({ error: "Username already taken" });
            }
        }

        // Check if the new email is already in use by another user
        if (email !== currentUser.email) {
            const emailCheck = await pool.query(
                "SELECT id FROM users WHERE email = $1 AND id != $2",
                [email, id]
            );

            if (emailCheck.rows.length > 0) {
                return res.status(400).json({ error: "Email already in use" });
            }
        }

        // Update the user information
        const result = await pool.query(
            "UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email",
            [username, email, id]
        );

        res.json({ message: "User updated!", user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error updating user" });
    }
});

// Update password of user by id
router.put("/:id/password", authenticateUser, async (req, res) => {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: "Both old and new passwords are required" });
    }

    try {
        // Fetch the current password hash from the database
        const userResult = await pool.query("SELECT password_hash FROM users WHERE id = $1",
            [id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const currentHash = userResult.rows[0].password_hash;

        if (!currentHash) {
            return res.status(500).json({ error: "User does not have a password set" });
        }

        // Compare old password with stored hash
        const isMatch = await bcrypt.compare(oldPassword, currentHash);

        if (!isMatch) {
            return res.status(400).json({ error: "Old password is incorrect" });
        }

        // Ensure the new password is different
        const isSamePassword = await bcrypt.compare(newPassword, currentHash);

        if (isSamePassword) {
            return res.status(400).json({ error: "New password must be different from the old password" });
        }

        // Hash the new password and update it in the database
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2",
            [hashedPassword, id]
        );
        res.json({ message: "Password updated successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;