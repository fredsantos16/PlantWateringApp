const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const listEndpoints = require("express-list-endpoints");
const { Pool } = require("pg")


// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.connect()
    .then(()=> console.log("Connected to PostgreSQL"))
    .catch(err => console.error("Database connection error:", err));

// Importing Routes
const usersRoutes = require("./routes/users");
const plantRoutes = require("./routes/plants");
const wateringScheduleRoutes = require("./routes/watering_schedules");
const plantNeedsRoutes = require("./routes/plant_needs");
const wateringLogsRoutes = require("./routes/watering_logs");
const sensorRoutes = require("./routes/sensors");
const authRoutes = require("./routes/auth");

// Registering Routes
console.log(authRoutes);
app.use("/users", usersRoutes);
app.use("/plants", plantRoutes);
app.use("/watering-schedules", wateringScheduleRoutes);
app.use("/plant-needs", plantNeedsRoutes);
app.use("/watering-logs", wateringLogsRoutes);
app.use("/sensors", sensorRoutes);
app.use("/auth", authRoutes);

//Password reset variable debugging
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_FROM:", process.env.EMAIL_FROM);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

// Test Route
app.get("/", (req, res) => {
    res.send("Backend is running!");
});

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
    next();
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(listEndpoints(app));
});
