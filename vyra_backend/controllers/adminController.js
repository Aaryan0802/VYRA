const db = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        // 1. Total Revenue - Case-insensitive check and handling nulls
        const [revenueRes] = await db.query(
            'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE LOWER(status) != "pending"'
        );
        
        // 2. Count acquisitions
        const [orderRes] = await db.query('SELECT COUNT(*) as count FROM orders');
        
        // 3. Count clients
        const [userRes] = await db.query('SELECT COUNT(*) as count FROM users');

        // 4. Fetch recent orders - matched to your exact table columns
        const [recentOrders] = await db.query(`
            SELECT o.id, u.full_name, o.total_amount, o.status, o.razorpay_payment_id 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC LIMIT 10
        `);

        res.json({
            revenue: revenueRes[0].total || 0,
            orderCount: orderRes[0].count || 0,
            userCount: userRes[0].count || 0,
            recentOrders: recentOrders || []
        });
    } catch (error) {
        console.error("MAISON ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// --- Add these below your existing getStats function ---

exports.getAllOrders = async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT o.id, u.full_name, o.total_amount, o.status, o.created_at 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC
        `);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT id, full_name, email, phone, city, role 
            FROM users 
            ORDER BY created_at DESC
        `);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};