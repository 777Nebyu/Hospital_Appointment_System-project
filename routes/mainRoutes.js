// routes/mainRoutes.js
// Main Routes - Public routes

const router = require('express').Router();
const mainController = require('../controllers/mainController');

router.get('/', mainController.getHome);
router.get('/dashboard', mainController.getDashboard);
router.get('/about', mainController.getAbout);
router.get('/contact', mainController.getContact);

module.exports = router;