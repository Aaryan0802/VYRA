const db = require('../config/db');

// Receive message from customercare.html
exports.submitMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: "All fields are required." });
        }
        
        await db.query(
            'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
            [name, email, message]
        );
        res.status(201).json({ success: true, message: "Inquiry received." });
    } catch (error) {
        console.error("Error saving contact message:", error);
        res.status(500).json({ error: "Failed to submit inquiry." });
    }
};

// Admin route to view all messages
exports.getMessages = async (req, res) => {
    try {
        const [messages] = await db.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch messages." });
    }
};

// Admin route to mark a message as read/resolved
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("UPDATE contact_messages SET status = 'resolved' WHERE id = ?", [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to update status." });
    }
};