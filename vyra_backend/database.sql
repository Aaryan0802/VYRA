-- 1. Setup Database
CREATE DATABASE IF NOT EXISTS vyra_db;
USE vyra_db;

-- 2. Drop existing tables to avoid conflicts (ORDER MATTERS due to Foreign Keys)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. Users Table (Stores login, profile, and address details)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- To store hashed passwords
    phone VARCHAR(15),
    address TEXT,
    city VARCHAR(50),
    postal_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products Table (Stores your 48 fragrances)
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    notes TEXT, -- Stores fragrance profile (e.g., Cedar, Rose)
    stock INT DEFAULT 50,
    image_url VARCHAR(255) NOT NULL, -- Relative path like /uploads/woody.jpg
    gender ENUM('Male', 'Female', 'Unisex') DEFAULT 'Unisex',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Cart Table (Links Users to Products)
CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 6. Indexes for Performance
CREATE INDEX idx_product_gender ON products(gender);
CREATE INDEX idx_user_email ON users(email);