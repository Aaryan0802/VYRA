const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const shopController = require('../controllers/shopController');
const paymentController = require('../controllers/paymentController');
const contactController = require('../controllers/contactController');
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const upload = require('../middleware/upload');
const chatController = require('../controllers/chatController');

// Public Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/auth/google', authController.googleLogin);
router.get('/products', productController.getAllProducts);
router.post('/chat', chatController.handleChat);

// Admin Routes (Can add an isAdmin middleware later)
router.post('/products', upload.single('product_image'), productController.createProduct);
router.get('/admin/stats', auth.verifyToken, auth.isAdmin, adminController.getStats);
router.get('/admin/orders', auth.verifyToken, auth.isAdmin, adminController.getAllOrders);
router.get('/admin/users', auth.verifyToken, auth.isAdmin, adminController.getAllUsers);
router.put('/admin/orders/:id', auth.verifyToken, auth.isAdmin, adminController.updateOrderStatus);
router.get('/orders', auth.verifyToken, shopController.getUserOrders);
router.put('/cart/:productId', auth.verifyToken, shopController.updateCartQuantity);
router.delete('/cart/:productId', auth.verifyToken, shopController.removeFromCart);
router.get('/purchased-products', auth.verifyToken, shopController.getPurchasedProducts);
router.post('/contact', contactController.submitMessage);
router.get('/admin/messages', auth.verifyToken, auth.isAdmin, contactController.getMessages);
router.put('/admin/messages/:id', auth.verifyToken, auth.isAdmin, contactController.markAsRead);
// Protected Customer Routes (Requires JWT)
router.get('/cart', auth.verifyToken, shopController.getCart);
router.put('/update-profile', auth.verifyToken, authController.updateProfile);
router.post('/cart', auth.verifyToken, shopController.addToCart);
router.post('/checkout', auth.verifyToken, paymentController.verifyPayment);
router.post('/create-order', auth.verifyToken, paymentController.createOrder);
router.get('/reviews/:id', productController.getProductReviews);
router.post('/reviews', productController.addReview);
router.put('/products/:id', auth.verifyToken, auth.isAdmin, productController.updateProduct);

module.exports = router;