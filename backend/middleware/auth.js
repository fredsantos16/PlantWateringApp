const jwt = require("jsonwebtoken");
require("dotenv").config();

// Auth middleware
const authenticateUser = (req, res, next) => {
    // Extract token from header
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    // Verifies if token is valid and attaches the userID and username to req.user
    try{
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err){
        if (err.name === "TokenExpiredError"){
            return res.status(401).json({ error: "Token expired", code: "TOKEN_EXPIRED"});
        }
        return res.status(401).json({ error: "Invalid token", code: "INVALID_TOKEN"});
    }
};

module.exports = authenticateUser;