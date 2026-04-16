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