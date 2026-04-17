const db = require('../config/db');

// Add or update item in cart securely (FIXED: Now uses frontend quantity!)
exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.id; 
        const { product_id, quantity } = req.body;
        
        // Use the quantity sent from frontend, default to 1 if missing
        const qtyToAdd = quantity ? parseInt(quantity) : 1;

        const [existing] = await db.query('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [userId, product_id]);

        if (existing.length > 0) {
            // Add the new quantity to the existing quantity
            await db.query('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [qtyToAdd, existing[0].id]);
        } else {
            // Insert with the correct quantity
            await db.query('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [userId, product_id, qtyToAdd]);
        }
        res.json({ message: "Cart updated successfully" });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        // FIXED: Changed c.id to c.product_id so the frontend buttons target the correct item
        const [items] = await db.query(`
            SELECT c.product_id, p.name, p.price, p.image_url, c.quantity 
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
    const connection = await db.getConnection(); 
    try {
        const userId = req.user.id;
        await connection.beginTransaction();

        const [cartItems] = await connection.query(`
            SELECT c.product_id, c.quantity, p.price 
            FROM cart c 
            JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = ?
        `, [userId]);

        if (cartItems.length === 0) return res.status(400).json({ message: "Cart is empty" });

        let totalAmount = 0;
        cartItems.forEach(item => { totalAmount += item.quantity * item.price; });

        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
            [userId, totalAmount, 'processing']
        );
        const orderId = orderResult.insertId;

        for (let item of cartItems) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
            await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
        }

        await connection.query('DELETE FROM cart WHERE user_id = ?', [userId]);

        await connection.commit(); 
        res.json({ message: "Checkout successful", orderId, totalAmount });
    } catch (error) {
        await connection.rollback(); 
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id; 

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

// Fetch only products the user has actually purchased
exports.getPurchasedProducts = async (req, res) => {
    const db = require('../config/db');
    const userId = req.user.id;

    try {
        // Query joins orders and order_items to find exactly what this user bought
        const query = `
            SELECT DISTINCT p.id, p.name 
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            WHERE o.user_id = ? AND o.status != 'cancelled'
        `;
        
        const [products] = await db.query(query, [userId]);
        res.json(products);
    } catch (err) {
        console.error("Error fetching purchased products:", err);
        res.status(500).json({ error: "Failed to verify acquisition history." });
    }
};