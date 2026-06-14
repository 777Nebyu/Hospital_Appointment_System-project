
const router = require('express').Router();
const authController = require('../controllers/authController');
const { validateLogin, validateRegistration, authLimiter } = require('../middleware/security');
const { redirectIfAuthenticated } = require('../middleware/authMiddleware');

// Login
router.get('/login', redirectIfAuthenticated, authController.getLogin);
router.post('/login', authLimiter, validateLogin, authController.postLogin);

// Register
router.get('/register', redirectIfAuthenticated, authController.getRegister);
router.post('/register', authLimiter, validateRegistration, authController.postRegister);

// Logout
router.get('/logout', authController.logout);

// Forgot Password (direct reset)
router.get('/forgot-password', redirectIfAuthenticated, authController.getForgotPassword);
router.post('/forgot-password', authLimiter, authController.postForgotPassword);

module.exports = router;