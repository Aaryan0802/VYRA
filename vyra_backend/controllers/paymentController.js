const Razorpay = require('razorpay');
const db = require('../config/db');

const razorpay = new Razorpay({
    key_id: 'rzp_test_SeGqnQo8lCdohV', // Replace with your Test Key ID
    key_secret: 'Mcd3kMOoK8PrgDyaXCi76Ld2'   // Replace with your Test Key Secret
});

exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.id;

        // --- NEW: Strict Shipping Validation ---
        const [userRecords] = await db.query('SELECT phone, address, city, postal_code FROM users WHERE id = ?', [userId]);
        const u = userRecords[0];
        
        // If any of the required shipping fields are empty, block the order!
        if (!u.phone || !u.address || !u.city || !u.postal_code) {
            return res.status(400).json({ 
                error: "INCOMPLETE_PROFILE", 
                message: "Shipping identity incomplete. Please update your address in the Client Portal." 
            });
        }
        
        // 1. Calculate total from the user's real cart in MySQL
        const [items] = await db.query(
            `SELECT c.quantity, p.price FROM cart c 
             JOIN products p ON c.product_id = p.id 
             WHERE c.user_id = ?`, [userId]
        );

        let totalAmount = 0;
        items.forEach(item => { totalAmount += item.quantity * parseFloat(item.price); });

        if (totalAmount <= 0) return res.status(400).json({ message: "Cart is empty" });

        // 2. Create Razorpay Order
        const options = {
            amount: Math.round(totalAmount * 100), 
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        
        res.json({
            order_id: order.id,
            amount: order.amount,
            key_id: razorpay.key_id,
            user: req.user
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id } = req.body;
    const userId = req.user.id;

    try {
        // 1. Fetch the user's cart
        const [cartItems] = await db.query(`
            SELECT c.product_id, c.quantity, p.price 
            FROM cart c 
            JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = ?
        `, [userId]);

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // 2. Calculate Final Total Safely
        let totalAmount = 0;
        cartItems.forEach(item => { totalAmount += item.quantity * parseFloat(item.price); });

        // 3. Create the actual Order in the database
        // FIXED: Changed 'Paid' to 'processing' to respect your database's strict column rules
        const [orderResult] = await db.query(
            'INSERT INTO orders (user_id, total_amount, status, razorpay_payment_id) VALUES (?, ?, ?, ?)',
            [userId, totalAmount, 'processing', razorpay_payment_id] 
        );
        const orderId = orderResult.insertId;

        // 4. Move items from Cart to Order_Items and deduct Stock
        for (let item of cartItems) {
            await db.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
            await db.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
        }

        // 5. Clear the Cart
        await db.query('DELETE FROM cart WHERE user_id = ?', [userId]);

        res.json({ success: true, message: "Acquisition archived." });
    } catch (err) {
        console.error("Payment sync failed:", err);
        // This will now send the exact database error to your frontend alert if it ever fails again
        res.status(500).json({ error: err.message });
    }
};