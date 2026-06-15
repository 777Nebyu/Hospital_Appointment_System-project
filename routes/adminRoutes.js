// routes/adminRoutes.js
// Admin Routes - Protected by authentication and admin role

const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/authMiddleware');
const { validateDoctor } = require('../middleware/security');

router.get('/dashboard', isAdmin, adminController.getDashboard);
router.get('/doctors', isAdmin, adminController.getDoctors);
router.get('/doctors/add', isAdmin, adminController.getAddDoctor);
router.post('/doctors/add', isAdmin, validateDoctor, adminController.postAddDoctor);
router.get('/doctors/edit/:id', isAdmin, adminController.getEditDoctor);
router.post('/doctors/edit/:id', isAdmin, validateDoctor, adminController.postUpdateDoctor);
router.post('/doctors/delete/:id', isAdmin, adminController.postDeleteDoctor);
router.get('/patients', isAdmin, adminController.getPatients);
router.get('/patients/edit/:id', isAdmin, adminController.getEditPatient);
router.post('/patients/edit/:id', isAdmin, adminController.postUpdatePatient);
router.post('/patients/delete/:id', isAdmin, adminController.postDeletePatient);
router.get('/appointments', isAdmin, adminController.getAppointments);
router.post('/appointments/:appointmentId/status', isAdmin, adminController.postUpdateAppointmentStatus);
router.post('/appointments/delete/:id', isAdmin, adminController.postDeleteAppointment);

module.exports = router;
