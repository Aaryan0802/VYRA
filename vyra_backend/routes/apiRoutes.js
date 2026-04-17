const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const shopController = require('../controllers/shopController');
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const upload = require('../middleware/upload');

// Public Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/auth/google', authController.googleLogin);
router.get('/products', productController.getAllProducts);

// Admin Routes (Can add an isAdmin middleware later)
router.post('/products', upload.single('product_image'), productController.createProduct);
router.get('/admin/stats', auth.verifyToken, auth.isAdmin, adminController.getStats);
router.get('/admin/orders', auth.verifyToken, auth.isAdmin, adminController.getAllOrders);
router.get('/admin/users', auth.verifyToken, auth.isAdmin, adminController.getAllUsers);
router.get('/orders', auth.verifyToken, shopController.getUserOrders);


// Protected Customer Routes (Requires JWT)
router.get('/cart', auth.verifyToken, shopController.getCart);
router.put('/update-profile', auth.verifyToken, authController.updateProfile);
router.post('/cart', auth.verifyToken, shopController.addToCart);
router.post('/checkout', auth.verifyToken, shopController.checkout);
router.post('/create-order', auth.verifyToken, paymentController.createOrder);
router.get('/reviews/:id', productController.getProductReviews);

module.exports = router;