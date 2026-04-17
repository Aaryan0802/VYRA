const db = require('../config/db');

// Get high-level stats for the dashboard
exports.getStats = async (req, res) => {
    try {
        const [revenue] = await db.query("SELECT SUM(total_amount) as total FROM orders WHERE status != 'cancelled'");
        const [orderCount] = await db.query("SELECT COUNT(*) as count FROM orders");
        const [userCount] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
        const [recentOrders] = await db.query(`
            SELECT o.*, u.full_name 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC LIMIT 5
        `);

        res.json({
            revenue: revenue[0].total || 0,
            orderCount: orderCount[0].count,
            userCount: userCount[0].count,
            recentOrders: recentOrders
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to load Atelier insights" });
    }
};

// Update an order's status (Processing -> Shipped -> Delivered)
// vyra_backend/controllers/adminController.js

exports.updateOrderStatus = async (req, res) => {
    const { id } = req.params; // Captures the :id from the URL
    const { status } = req.body; // Captures the status from the JSON body
    const db = require('../config/db');

    try {
        const query = "UPDATE orders SET status = ? WHERE id = ?";
        // Using await is CRITICAL to ensure the database saves before the response is sent
        const [result] = await db.query(query, [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.json({ success: true, message: "Transit status archived." });
    } catch (err) {
        console.error("Database Update Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Existing logic for getting all orders and users...
exports.getAllOrders = async (req, res) => {
    const [orders] = await db.query("SELECT o.*, u.full_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC");
    res.json(orders);
};

exports.getAllUsers = async (req, res) => {
    const [users] = await db.query("SELECT id, full_name, email, city, role, phone FROM users");
    res.json(users);
};