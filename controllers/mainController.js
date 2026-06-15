// controllers/mainController.js
// Main Controller - Home page, general dashboard, public pages

const DoctorModel = require('../models/DoctorModel');
const PatientModel = require('../models/PatientModel');
const AppointmentModel = require('../models/AppointmentModel');

const getHome = async (req, res) => {
    try {
        const doctorCount = await DoctorModel.getCount();
        const patientCount = await PatientModel.getCount();
        const appointmentCount = await AppointmentModel.getCount();
        const doctors = await DoctorModel.getAll({ isActive: true });

        res.render('home', {
            title: 'Hospital Appointment System',
            stats: { doctors: doctorCount, patients: patientCount, appointments: appointmentCount },
            featuredDoctors: doctors.slice(0, 4),
            errors: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Home page error:', error);
        res.render('home', {
            title: 'Hospital Appointment System',
            stats: { doctors: 0, patients: 0, appointments: 0 },
            featuredDoctors: [],
            errors: req.flash('error'),
            success: req.flash('success')
        });
    }
};

const getDashboard = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/auth/login');
        switch (req.session.role) {
            case 'admin': return res.redirect('/admin/dashboard');
            case 'doctor': return res.redirect('/doctor/dashboard');
            case 'patient': return res.redirect('/patient/dashboard');
            default: return res.redirect('/');
        }
    } catch (error) {
        console.error('Dashboard error:', error);
        req.flash('error', 'Failed to load dashboard');
        res.redirect('/');
    }
};

const getAbout = (req, res) => {
    res.render('about', { title: 'About Us', errors: req.flash('error'), success: req.flash('success') });
};

const getContact = (req, res) => {
    res.render('contact', { title: 'Contact Us', errors: req.flash('error'), success: req.flash('success') });
};

module.exports = { getHome, getDashboard, getAbout, getContact };