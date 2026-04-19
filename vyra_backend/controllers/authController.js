const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../config/db');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);



exports.register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // 1. Check if user already exists
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Email already registered." });
        }

        // 2. Encrypt the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Save to Database
        // In authController.js -> exports.register
        await db.query(
            'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
            [fullName, email, hashedPassword, 'customer'] // Explicitly set as 'customer'
        );

        res.status(201).json({ message: "Account created successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) return res.status(401).json({ message: "Invalid credentials" });
        
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        // Inside your login function in authController.js
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role // CRITICAL: This allows the isAdmin middleware to work
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );
        delete user.password;
        res.json({ token, user });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; // From verifyToken middleware
        const { fullName, phone, address, city, postal_code } = req.body;

        await db.query(
            `UPDATE users SET full_name = ?, phone = ?, address = ?, city = ?, postal_code = ? 
             WHERE id = ?`,
            [fullName, phone, address, city, postal_code, userId]
        );

        // Fetch updated user to send back to frontend
        const [updatedUser] = await db.query('SELECT id, full_name, email, phone, address, city, postal_code FROM users WHERE id = ?', [userId]);
        
        res.json({ message: "Profile updated!", user: updatedUser[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.googleLogin = async (req, res) => {
    // Refer to previous response for Google Auth logic
};