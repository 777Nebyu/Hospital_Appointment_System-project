// routes/patientRoutes.js
// Patient Routes - Protected by authentication and patient role

const router = require('express').Router();
const patientController = require('../controllers/patientController');
const { isPatient } = require('../middleware/authMiddleware');
const { validateAppointment } = require('../middleware/security');

router.get('/dashboard', isPatient, patientController.getDashboard);
router.get('/profile', isPatient, patientController.getProfile);
router.post('/profile', isPatient, patientController.updateProfile);
router.get('/search-doctors', isPatient, patientController.getSearchDoctors);
router.get('/book-appointment', isPatient, patientController.getBookAppointment);
router.post('/book-appointment', isPatient, validateAppointment, patientController.postBookAppointment);
router.get('/appointments', isPatient, patientController.getMyAppointments);
router.post('/appointments/:id/cancel', isPatient, patientController.cancelAppointment);

module.exports = router;
