// controllers/patientController.js
// Patient Controller - Patient-specific operations

const PatientModel = require('../models/PatientModel');
const DoctorModel = require('../models/DoctorModel');
const AppointmentModel = require('../models/AppointmentModel');

const getDashboard = async (req, res) => {
    try {
        const patient = await PatientModel.findByUserId(req.session.userId);
        if (!patient) {
            req.flash('error', 'Patient profile not found');
            return res.redirect('/auth/logout');
        }
        const appointments = await AppointmentModel.getByPatient(patient.pid);
        const pendingCount = appointments.filter(a => a.status === 'pending').length;
        const approvedCount = appointments.filter(a => a.status === 'approved').length;
        const completedCount = appointments.filter(a => a.status === 'completed').length;

        res.render('patient/dashboard', {
            title: 'Patient Dashboard',
            patient,
            appointments: appointments.slice(0, 5),
            stats: { total: appointments.length, pending: pendingCount, approved: approvedCount, completed: completedCount },
            errors: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Patient dashboard error:', error);
        req.flash('error', 'Failed to load dashboard');
        res.redirect('/');
    }
};

const getProfile = async (req, res) => {
    try {
        const patient = await PatientModel.findByUserId(req.session.userId);
        if (!patient) {
            req.flash('error', 'Patient profile not found');
            return res.redirect('/dashboard');
        }
        res.render('patient/profile', {
            title: 'My Profile',
            patient,
            errors: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Profile error:', error);
        req.flash('error', 'Failed to load profile');
        res.redirect('/dashboard');
    }
};

const updateProfile = async (req, res) => {
    try {
        const patient = await PatientModel.findByUserId(req.session.userId);
        if (!patient) {
            req.flash('error', 'Patient profile not found');
            return res.redirect('/dashboard');
        }
        await PatientModel.update(patient.pid, {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            dateOfBirth: req.body.dateOfBirth,
            gender: req.body.gender,
            address: req.body.address,
            emergencyContact: req.body.emergencyContact,
            bloodType: req.body.bloodType
        });
        req.flash('success', 'Profile updated successfully!');
        res.redirect('/patient/profile');
    } catch (error) {
        console.error('Update profile error:', error);
        req.flash('error', 'Failed to update profile');
        res.redirect('/patient/profile');
    }
};

const getSearchDoctors = async (req, res) => {
    try {
        const { q, specialization } = req.query;
        let doctors = [];
        if (q || specialization) {
            doctors = await DoctorModel.getAll({ search: q, specialization: specialization, isActive: true });
        } else {
            doctors = await DoctorModel.getAll({ isActive: true });
        }
        res.render('patient/search-doctors', {
            title: 'Search Doctors',
            doctors,
            searchQuery: q || '',
            specializationFilter: specialization || '',
            errors: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Search doctors error:', error);
        req.flash('error', 'Failed to search doctors');
        res.redirect('/dashboard');
    }
};

const getBookAppointment = async (req, res) => {
    try {
        const { doctorId } = req.query;
        let selectedDoctor = null;
        if (doctorId) selectedDoctor = await DoctorModel.findById(doctorId);
        const doctors = await DoctorModel.getAll({ isActive: true });
        res.render('patient/book-appointment', {
            title: 'Book Appointment',
            doctors,
            selectedDoctor,
            errors: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Book appointment page error:', error);
        req.flash('error', 'Failed to load booking page');
        res.redirect('/patient/search-doctors');
    }
};

const postBookAppointment = async (req, res) => {
    try {
        const patient = await PatientModel.findByUserId(req.session.userId);
        if (!patient) {
            req.flash('error', 'Patient profile not found');
            return res.redirect('/dashboard');
        }
        const { doctorId, appointmentDate, appointmentTime, reason } = req.body;
        const isAvailable = await AppointmentModel.isTimeSlotAvailable(doctorId, appointmentDate, appointmentTime);
        if (!isAvailable) {
            req.flash('error', 'This time slot is already booked. Please choose another time.');
            return res.redirect('/patient/book-appointment');
        }
        await AppointmentModel.create({ patientId: patient.pid, doctorId, appointmentDate, appointmentTime, reason });
        req.flash('success', 'Appointment booked successfully!');
        res.redirect('/patient/appointments');
    } catch (error) {
        console.error('Book appointment error:', error);
        req.flash('error', 'Failed to book appointment');
        res.redirect('/patient/book-appointment');
    }
};

const getMyAppointments = async (req, res) => {
    try {
        const patient = await PatientModel.findByUserId(req.session.userId);
        if (!patient) {
            req.flash('error', 'Patient profile not found');
            return res.redirect('/dashboard');
        }
        const appointments = await AppointmentModel.getByPatient(patient.pid);
        res.render('patient/appointments', {
            title: 'My Appointments',
            appointments,
            errors: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('My appointments error:', error);
        req.flash('error', 'Failed to load appointments');
        res.redirect('/dashboard');
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await AppointmentModel.findById(id);
        if (!appointment) {
            req.flash('error', 'Appointment not found');
            return res.redirect('/patient/appointments');
        }
        const patient = await PatientModel.findByUserId(req.session.userId);
        if (appointment.patient_id !== patient.pid) {
            req.flash('error', 'Unauthorized action');
            return res.redirect('/patient/appointments');
        }
        await AppointmentModel.cancel(id);
        req.flash('success', 'Appointment cancelled successfully!');
        res.redirect('/patient/appointments');
    } catch (error) {
        console.error('Cancel appointment error:', error);
        req.flash('error', 'Failed to cancel appointment');
        res.redirect('/patient/appointments');
    }
};

module.exports = {
    getDashboard, getProfile, updateProfile, getSearchDoctors,
    getBookAppointment, postBookAppointment, getMyAppointments, cancelAppointment
};
