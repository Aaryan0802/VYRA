const Razorpay = require('razorpay');
const db = require('../config/db');

const razorpay = new Razorpay({
    key_id: 'rzp_test_SeGqnQo8lCdohV', // Replace with your Test Key ID
    key_secret: 'Mcd3kMOoK8PrgDyaXCi76Ld2'   // Replace with your Test Key Secret
});

exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // 1. Calculate total from the user's real cart in MySQL
        const [items] = await db.query(
            `SELECT c.quantity, p.price FROM cart c 
             JOIN products p ON c.product_id = p.id 
             WHERE c.user_id = ?`, [userId]
        );

        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (totalAmount <= 0) return res.status(400).json({ message: "Cart is empty" });

        // 2. Create Razorpay Order (Amount must be in Paise)
        const options = {
            amount: totalAmount * 100, 
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        
        // Send order details + user info for the modal
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
    const db = require('../config/db');
    const { razorpay_payment_id, razorpay_order_id } = req.body;

    try {
        // We find the order that matches the Razorpay Order ID and update it
        const query = `
            UPDATE orders 
            SET razorpay_payment_id = ?, status = 'Paid' 
            WHERE id = (
                SELECT order_id FROM (
                    /* This subquery finds the local ID based on the Razorpay ID if you store it, 
                       otherwise we use the most recent processing order for security */
                    SELECT id as order_id FROM orders 
                    WHERE user_id = ? AND status = 'processing' 
                    ORDER BY created_at DESC LIMIT 1
                ) AS temp
            )
        `;

        await db.query(query, [razorpay_payment_id, req.user.id]);
        
        // Also clear the user's cart after successful payment
        await db.query("DELETE FROM cart WHERE user_id = ?", [req.user.id]);

        res.json({ success: true, message: "Acquisition archived." });
    } catch (err) {
        console.error("Payment sync failed:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};