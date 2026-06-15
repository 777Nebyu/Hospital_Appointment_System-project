// controllers/adminController.js
// Admin Controller - Administrative operations

const UserModel = require('../models/UserModel');
const PatientModel = require('../models/PatientModel');
const DoctorModel = require('../models/DoctorModel');
const AppointmentModel = require('../models/AppointmentModel');

const getDashboard = async (req, res) => {
    try {
        const doctorCount = await DoctorModel.getCount();
        const patientCount = await PatientModel.getCount();
        const appointmentCount = await AppointmentModel.getCount();
        const statusCounts = await AppointmentModel.getCountsByStatus();

        const stats = {
            doctors: doctorCount,
            patients: patientCount,
            appointments: appointmentCount,
            pending: statusCounts.find(s => s.status === 'pending')?.count || 0,
            approved: statusCounts.find(s => s.status === 'approved')?.count || 0,
            completed: statusCounts.find(s => s.status === 'completed')?.count || 0,
            rejected: statusCounts.find(s => s.status === 'rejected')?.count || 0,
            cancelled: statusCounts.find(s => s.status === 'cancelled')?.count || 0
        };

        const recentAppointments = await AppointmentModel.getAll({});

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            stats,
            recentAppointments: recentAppointments.slice(0, 10),
            errors: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        req.flash('error', 'Failed to load dashboard');
        res.redirect('/');
    }
};

const getDoctors = async (req, res) => {
    try {
        const doctors = await DoctorModel.getAll();
        res.render('admin/doctors', {
            title: 'Manage Doctors',
            doctors,
            errors: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Get doctors error:', error);
        req.flash('error', 'Failed to load doctors');
        res.redirect('/admin/dashboard');
    }
};

const getAddDoctor = (req, res) => {
    res.render('admin/add-doctor', {
        title: 'Add Doctor',
        errors: req.flash('error'),
        success: req.flash('success')
    });
};

const postAddDoctor = async (req, res) => {
    try {
        const { firstName, lastName, email, password, specialization, phone, experienceYears, qualification } = req.body;
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            req.flash('error', 'Email is already registered');
            return res.redirect('/admin/doctors/add');
        }
        const user = await UserModel.register({ email, password, role: 'doctor' });
        await DoctorModel.create({
            uid: user.uid,
            firstName, lastName, specialization, phone,
            experienceYears: parseInt(experienceYears) || 0, qualification
        });
        req.flash('success', 'Doctor added successfully!');
        res.redirect('/admin/doctors');
    } catch (error) {
        console.error('Add doctor error:', error);
        req.flash('error', error.message || 'Failed to add doctor');
        res.redirect('/admin/doctors/add');
    }
};

const getEditDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await DoctorModel.findById(id);
        if (!doctor) {
            req.flash('error', 'Doctor not found');
            return res.redirect('/admin/doctors');
        }
        res.render('admin/edit-doctor', {
            title: 'Edit Doctor',
            doctor,
            errors: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Edit doctor page error:', error);
        req.flash('error', 'Failed to load doctor');
        res.redirect('/admin/doctors');
    }
};

const postUpdateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        await DoctorModel.update(id, {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            specialization: req.body.specialization,
            phone: req.body.phone,
            experienceYears: parseInt(req.body.experienceYears) || 0,
            qualification: req.body.qualification,
            isActive: req.body.isActive === 'on'
        });
        req.flash('success', 'Doctor updated successfully!');
        res.redirect('/admin/doctors');
    } catch (error) {
        console.error('Update doctor error:', error);
        req.flash('error', 'Failed to update doctor');
        res.redirect(`/admin/doctors/edit/${id}`);
    }
};

const postDeleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        await DoctorModel.delete(id);
        req.flash('success', 'Doctor deleted successfully!');
        res.redirect('/admin/doctors');
    } catch (error) {
        console.error('Delete doctor error:', error);
        req.flash('error', 'Failed to delete doctor');
        res.redirect('/admin/doctors');
    }
};

const getPatients = async (req, res) => {
    try {
        const patients = await PatientModel.getAll();
        res.render('admin/patients', {
            title: 'Manage Patients',
            patients,
            errors: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Get patients error:', error);
        req.flash('error', 'Failed to load patients');
        res.redirect('/admin/dashboard');
    }
};

const getEditPatient = async (req, res) => {
    try {
        const { id } = req.params;
        const patient = await PatientModel.findById(id);
        if (!patient) {
            req.flash('error', 'Patient not found');
            return res.redirect('/admin/patients');
        }
        res.render('admin/edit-patient', {
            title: 'Edit Patient',
            patient,
            errors: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Edit patient page error:', error);
        req.flash('error', 'Failed to load patient');
        res.redirect('/admin/patients');
    }
};

const postUpdatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        await PatientModel.update(id, {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            dateOfBirth: req.body.dateOfBirth,
            gender: req.body.gender,
            address: req.body.address,
            emergencyContact: req.body.emergencyContact,
            bloodType: req.body.bloodType
        });
        req.flash('success', 'Patient updated successfully!');
        res.redirect('/admin/patients');
    } catch (error) {
        console.error('Update patient error:', error);
        req.flash('error', 'Failed to update patient');
        res.redirect(`/admin/patients/edit/${id}`);
    }
};

const postDeletePatient = async (req, res) => {
    try {
        const { id } = req.params;
        await PatientModel.delete(id);
        req.flash('success', 'Patient deleted successfully!');
        res.redirect('/admin/patients');
    } catch (error) {
        console.error('Delete patient error:', error);
        req.flash('error', 'Failed to delete patient');
        res.redirect('/admin/patients');
    }
};

const getAppointments = async (req, res) => {
    try {
        const { status, doctorId, patientId, dateFrom, dateTo } = req.query;
        const filters = {};
        if (status) filters.status = status;
        if (doctorId) filters.doctorId = doctorId;
        if (patientId) filters.patientId = patientId;
        if (dateFrom) filters.dateFrom = dateFrom;
        if (dateTo) filters.dateTo = dateTo;

        const appointments = await AppointmentModel.getAll(filters);
        const doctors = await DoctorModel.getAll();
        const patients = await PatientModel.getAll();

        res.render('admin/appointments', {
            title: 'Manage Appointments',
            appointments,
            doctors,
            patients,
            filters: { status, doctorId, patientId, dateFrom, dateTo },
            errors: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        req.flash('error', 'Failed to load appointments');
        res.redirect('/admin/dashboard');
    }
};

const postUpdateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status, notes } = req.body;
        await AppointmentModel.updateStatus(appointmentId, status, notes);
        req.flash('success', 'Appointment status updated successfully!');
        res.redirect('/admin/appointments');
    } catch (error) {
        console.error('Update appointment status error:', error);
        req.flash('error', 'Failed to update appointment status');
        res.redirect('/admin/appointments');
    }
};

const postDeleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        await AppointmentModel.delete(id);
        req.flash('success', 'Appointment deleted successfully!');
        res.redirect('/admin/appointments');
    } catch (error) {
        console.error('Delete appointment error:', error);
        req.flash('error', 'Failed to delete appointment');
        res.redirect('/admin/appointments');
    }
};

module.exports = {
    getDashboard, getDoctors, getAddDoctor, postAddDoctor, getEditDoctor, postUpdateDoctor, postDeleteDoctor,
    getPatients, getEditPatient, postUpdatePatient, postDeletePatient,
    getAppointments, postUpdateAppointmentStatus, postDeleteAppointment
};
