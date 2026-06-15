// routes/doctorRoutes.js
// Doctor Routes - Protected by authentication and doctor role

const router = require('express').Router();
const doctorController = require('../controllers/doctorController');
const { isDoctor } = require('../middleware/authMiddleware');

router.get('/dashboard', isDoctor, doctorController.getDashboard);
router.get('/profile', isDoctor, doctorController.getProfile);
router.post('/profile', isDoctor, doctorController.updateProfile);
router.get('/appointments', isDoctor, doctorController.getAppointments);
router.post('/appointments/:id/approve', isDoctor, doctorController.approveAppointment);
router.post('/appointments/:id/reject', isDoctor, doctorController.rejectAppointment);
router.post('/appointments/:id/complete', isDoctor, doctorController.completeAppointment);
router.get('/patients/:patientId', isDoctor, doctorController.getPatientInfo);

module.exports = router;
