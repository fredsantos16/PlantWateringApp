const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

// Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create a new user
router.post("/", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
            [username, email, password]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error creating user" });
    }
});

// Get all users
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, username, email FROM users");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching users" });
    }
});

// Get a user by id
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT id, username, email FROM users WHERE id = $1",
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
        res.json(result.row[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching user" });
    }
});

// Delete a user by id
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: "User not found" });
        res.json({ message: "User deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Error deleting user" });
    }
});

module.exports = router;