const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const { Pool } = require("pg")

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.connect()
    .then(()=> console.log("Connected to PostgreSQL"))
    .catch(err => console.error("Database connection error:". err));

// Importing Routes
const userRoutes = require("./routes/users");
const plantRoutes = require("./routes/plants");
const wateringScheduleRoutes = require("./routes/watering_schedules");
const plantNeedsRoutes = require("./routes/plant_needs");
const wateringLogsRoutes = require("./routes/watering_logs");
const sensorRoutes = require("./routes/sensors");
const authRoutes = require("./routes/auth");

// Registering Routes
app.use("/users", userRoutes);
app.use("/plants", plantRoutes);
app.use("/watering-schedules", wateringScheduleRoutes);
app.use("/plant-needs", plantNeedsRoutes);
app.use("/watering-logs", wateringLogsRoutes);
app.use("/sensors", sensorRoutes);
app.use("/auth", authRoutes);

// Test Route
app.get("/", (req, res) => {
    res.send("Backend is running!");
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
