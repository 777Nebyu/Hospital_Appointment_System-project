// controllers/doctorController.js
// Doctor Controller - Doctor-specific operations

const DoctorModel = require('../models/DoctorModel');
const AppointmentModel = require('../models/AppointmentModel');
const PatientModel = require('../models/PatientModel');

const getDashboard = async (req, res) => {
    try {
        const doctor = await DoctorModel.findByUserId(req.session.userId);
        if (!doctor) {
            req.flash('error', 'Doctor profile not found');
            return res.redirect('/auth/logout');
        }
        const todayAppointments = await AppointmentModel.getTodayAppointments(doctor.did);
        const allAppointments = await AppointmentModel.getByDoctor(doctor.did);
        const pendingCount = allAppointments.filter(a => a.status === 'pending').length;
        const approvedCount = allAppointments.filter(a => a.status === 'approved').length;
        const completedCount = allAppointments.filter(a => a.status === 'completed').length;

        res.render('doctor/dashboard', {
            title: 'Doctor Dashboard',
            doctor,
            todayAppointments,
            allAppointments: allAppointments.slice(0, 5),
            stats: { total: allAppointments.length, pending: pendingCount, approved: approvedCount, completed: completedCount },
            errors: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Doctor dashboard error:', error);
        req.flash('error', 'Failed to load dashboard');
        res.redirect('/');
    }
};

const getProfile = async (req, res) => {
    try {
        const doctor = await DoctorModel.findByUserId(req.session.userId);
        if (!doctor) {
            req.flash('error', 'Doctor profile not found');
            return res.redirect('/dashboard');
        }
        res.render('doctor/profile', {
            title: 'My Profile',
            doctor,
            errors: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Doctor profile error:', error);
        req.flash('error', 'Failed to load profile');
        res.redirect('/dashboard');
    }
};

const updateProfile = async (req, res) => {
    try {
        const doctor = await DoctorModel.findByUserId(req.session.userId);
        if (!doctor) {
            req.flash('error', 'Doctor profile not found');
            return res.redirect('/dashboard');
        }
        await DoctorModel.update(doctor.did, {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            specialization: req.body.specialization,
            phone: req.body.phone,
            experienceYears: req.body.experienceYears,
            qualification: req.body.qualification
        });
        req.flash('success', 'Profile updated successfully!');
        res.redirect('/doctor/profile');
    } catch (error) {
        console.error('Update doctor profile error:', error);
        req.flash('error', 'Failed to update profile');
        res.redirect('/doctor/profile');
    }
};

const getAppointments = async (req, res) => {
    try {
        const doctor = await DoctorModel.findByUserId(req.session.userId);
        if (!doctor) {
            req.flash('error', 'Doctor profile not found');
            return res.redirect('/dashboard');
        }
        const appointments = await AppointmentModel.getByDoctor(doctor.did);
        res.render('doctor/appointments', {
            title: 'My Appointments',
            appointments,
            errors: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Doctor appointments error:', error);
        req.flash('error', 'Failed to load appointments');
        res.redirect('/dashboard');
    }
};

const approveAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await DoctorModel.findByUserId(req.session.userId);
        const appointment = await AppointmentModel.findById(id);
        if (!appointment || appointment.doctor_id !== doctor.did) {
            req.flash('error', 'Appointment not found or unauthorized');
            return res.redirect('/doctor/appointments');
        }
        await AppointmentModel.updateStatus(id, 'approved', req.body.notes);
        req.flash('success', 'Appointment approved successfully!');
        res.redirect('/doctor/appointments');
    } catch (error) {
        console.error('Approve appointment error:', error);
        req.flash('error', 'Failed to approve appointment');
        res.redirect('/doctor/appointments');
    }
};

const rejectAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await DoctorModel.findByUserId(req.session.userId);
        const appointment = await AppointmentModel.findById(id);
        if (!appointment || appointment.doctor_id !== doctor.did) {
            req.flash('error', 'Appointment not found or unauthorized');
            return res.redirect('/doctor/appointments');
        }
        await AppointmentModel.updateStatus(id, 'rejected', req.body.notes);
        req.flash('success', 'Appointment rejected successfully!');
        res.redirect('/doctor/appointments');
    } catch (error) {
        console.error('Reject appointment error:', error);
        req.flash('error', 'Failed to reject appointment');
        res.redirect('/doctor/appointments');
    }
};

const completeAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await DoctorModel.findByUserId(req.session.userId);
        const appointment = await AppointmentModel.findById(id);
        if (!appointment || appointment.doctor_id !== doctor.did) {
            req.flash('error', 'Appointment not found or unauthorized');
            return res.redirect('/doctor/appointments');
        }
        await AppointmentModel.updateStatus(id, 'completed', req.body.notes);
        req.flash('success', 'Appointment marked as completed!');
        res.redirect('/doctor/appointments');
    } catch (error) {
        console.error('Complete appointment error:', error);
        req.flash('error', 'Failed to complete appointment');
        res.redirect('/doctor/appointments');
    }
};

const getPatientInfo = async (req, res) => {
    try {
        const { patientId } = req.params;
        const doctor = await DoctorModel.findByUserId(req.session.userId);
        const appointments = await AppointmentModel.getByDoctor(doctor.did);
        const hasAppointment = appointments.some(a => a.patient_id === parseInt(patientId));
        if (!hasAppointment) {
            req.flash('error', 'Unauthorized to view this patient');
            return res.redirect('/doctor/appointments');
        }
        const patient = await PatientModel.findById(patientId);
        if (!patient) {
            req.flash('error', 'Patient not found');
            return res.redirect('/doctor/appointments');
        }
        res.render('doctor/patient-info', {
            title: 'Patient Information',
            patient,
            errors: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Patient info error:', error);
        req.flash('error', 'Failed to load patient information');
        res.redirect('/doctor/appointments');
    }
};

module.exports = {
    getDashboard, getProfile, updateProfile, getAppointments,
    approveAppointment, rejectAppointment, completeAppointment, getPatientInfo
};
