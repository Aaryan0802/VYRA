const jwt = require('jsonwebtoken'); // Add this line
const db = require('../config/db');

exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Unauthorized" });
        req.user = decoded; // This now includes id, email, and role
        next();
    });
};

// In auth.js -> exports.isAdmin
exports.isAdmin = (req, res, next) => {
    console.log("User Role in Token:", req.user.role); // Add this to debug
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Access Denied: Administrative privileges required." });
    }
};