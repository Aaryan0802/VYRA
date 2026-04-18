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
    const connection = await db.getConnection(); // Use a transaction for safety
    const { razorpay_payment_id, razorpay_order_id } = req.body;
    const userId = req.user.id;

    try {
        await connection.beginTransaction();

        // 1. Fetch the user's cart
        const [cartItems] = await connection.query(`
            SELECT c.product_id, c.quantity, p.price 
            FROM cart c 
            JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = ?
        `, [userId]);

        if (cartItems.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: "Cart is empty" });
        }

        // 2. Calculate Final Total
        let totalAmount = 0;
        cartItems.forEach(item => { totalAmount += item.quantity * item.price; });

        // 3. Create the actual Order in the database
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total_amount, status, razorpay_payment_id) VALUES (?, ?, ?, ?)',
            [userId, totalAmount, 'Paid', razorpay_payment_id]
        );
        const orderId = orderResult.insertId;

        // 4. Move items from Cart to Order_Items and deduct Stock
        for (let item of cartItems) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
            await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
        }

        // 5. Clear the Cart
        await connection.query('DELETE FROM cart WHERE user_id = ?', [userId]);

        await connection.commit();
        res.json({ success: true, message: "Acquisition archived." });
    } catch (err) {
        await connection.rollback();
        console.error("Payment sync failed:", err);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        connection.release();
    }
};