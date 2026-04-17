const db = require('../config/db');

exports.getAllProducts = async (req, res) => {
    try {
        // 1. Check if the frontend asked for a specific gender
        const { gender } = req.query; 
        
        let query = 'SELECT * FROM products';
        let params = [];

        // 2. If a gender was requested (e.g., ?gender=Male), filter the database
        if (gender) {
            query += ' WHERE gender = ? OR gender = "Unisex"';
            params.push(gender);
        }

        // 3. Run the query and send the filtered list back
        const [products] = await db.query(query, params);
        res.json(products);
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, price, category, notes, stock } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        const [result] = await db.query(
            'INSERT INTO products (name, price, category, notes, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [name, price, category, notes, stock, imageUrl]
        );
        res.status(201).json({ message: "Product created", id: result.insertId });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

// Fetch reviews for a specific product
exports.getProductReviews = async (req, res) => {
    try {
        // It's safer to require the DB at the top of the file, 
        // but if it's here, ensure it perfectly matches your other controllers.
        const db = require('../config/db'); 
        
        const productId = req.params.id;
        const query = 'SELECT reviewer_name, rating, comment FROM reviews WHERE product_id = ? ORDER BY created_at DESC';
        
        // Using modern await syntax 
        const [results] = await db.query(query, [productId]);
        
        // Send the data back to the browser!
        res.json(results);

    } catch (err) {
        console.error("Error fetching reviews:", err);
        // Ensure a response is ALWAYS sent, even if it crashes
        res.status(500).json({ error: "Failed to load impressions" });
    }
};

// Submit a new customer review
exports.addReview = async (req, res) => {
    try {
        const db = require('../config/db'); 
        const { product_id, reviewer_name, rating, comment } = req.body;
        
        const query = 'INSERT INTO reviews (product_id, reviewer_name, rating, comment) VALUES (?, ?, ?, ?)';
        await db.query(query, [product_id, reviewer_name, rating, comment]);
        
        res.status(201).json({ message: "Review recorded successfully" });
    } catch (err) {
        console.error("Error adding review:", err);
        res.status(500).json({ error: "Failed to save impression" });
    }
};