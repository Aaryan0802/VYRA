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
    
    // Grabbing the ID sent from your updated transactions.html handler
    const { razorpay_payment_id } = req.body;
    const userId = req.user.id; // Assuming auth middleware provides this

    if (!razorpay_payment_id) {
        return res.status(400).json({ success: false, message: "Missing Payment ID" });
    }

    try {
        // Update the most recent 'processing' order for this specific user
        const query = `
            UPDATE orders 
            SET razorpay_payment_id = ?, status = 'Paid' 
            WHERE user_id = ? AND status = 'processing'
            ORDER BY created_at DESC 
            LIMIT 1
        `;

        await db.query(query, [razorpay_payment_id, userId]);
        
        res.json({ success: true, message: "Acquisition recorded in archives." });
    } catch (err) {
        console.error("Database error during payment verification:", err);
        res.status(500).json({ success: false, message: "Database update failed" });
    }
};