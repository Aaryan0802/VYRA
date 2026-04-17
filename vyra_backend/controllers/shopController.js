const db = require('../config/db');

// Add or update item in cart securely
exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.id; // From JWT Auth Middleware
        const { product_id } = req.body;

        // Check if item already in cart
        const [existing] = await db.query('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [userId, product_id]);

        if (existing.length > 0) {
            await db.query('UPDATE cart SET quantity = quantity + 1 WHERE id = ?', [existing[0].id]);
        } else {
            await db.query('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, 1)', [userId, product_id]);
        }
        res.json({ message: "Cart updated successfully" });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const [items] = await db.query(`
            SELECT c.id, p.name, p.price, p.image_url, c.quantity 
            FROM cart c 
            JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = ?`, [userId]);
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Secure Checkout & Server-Side Calculation
exports.checkout = async (req, res) => {
    const connection = await db.getConnection(); // Use transaction for multi-table safety
    try {
        const userId = req.user.id;
        await connection.beginTransaction();

        // 1. Get user's cart joined with live product prices
        const [cartItems] = await connection.query(`
            SELECT c.product_id, c.quantity, p.price 
            FROM cart c 
            JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = ?
        `, [userId]);

        if (cartItems.length === 0) return res.status(400).json({ message: "Cart is empty" });

        // 2. Calculate Total Server-Side
        let totalAmount = 0;
        cartItems.forEach(item => { totalAmount += item.quantity * item.price; });

        // 3. Create the Order record
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
            [userId, totalAmount, 'processing']
        );
        const orderId = orderResult.insertId;

        // 4. Create Order Items (The Receipt) & Update Stock
        for (let item of cartItems) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
            await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
        }

        // 5. Clear the user's cart
        await connection.query('DELETE FROM cart WHERE user_id = ?', [userId]);

        await connection.commit(); // Save everything
        res.json({ message: "Checkout successful", orderId, totalAmount });
    } catch (error) {
        await connection.rollback(); // Undo if something fails
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id; // Comes from the verifyToken middleware

        // Query the database for this specific user's orders, sorted newest first
        const [orders] = await db.query(
            'SELECT id, total_amount, status, razorpay_payment_id, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC', 
            [userId]
        );

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function to update quantity
exports.updateCartQuantity = async (req, res) => {
    const db = require('../config/db');
    const userId = req.user.id;
    const productId = req.params.productId;
    const { quantity } = req.body;

    try {
        await db.query("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?", [quantity, userId, productId]);
        res.json({ success: true, message: "Quantity updated" });
    } catch (err) {
        console.error("Cart update error:", err);
        res.status(500).json({ error: "Failed to update quantity" });
    }
};

// Function to delete item completely
exports.removeFromCart = async (req, res) => {
    const db = require('../config/db');
    const userId = req.user.id; 
    const productId = req.params.productId;

    try {
        await db.query("DELETE FROM cart WHERE user_id = ? AND product_id = ?", [userId, productId]);
        res.json({ success: true, message: "Item removed" });
    } catch (err) {
        console.error("Cart deletion error:", err);
        res.status(500).json({ error: "Failed to remove item" });
    }
};