
const UserModel = require('../models/UserModel');
const PatientModel = require('../models/PatientModel');
const DoctorModel = require('../models/DoctorModel');

const getLogin = (req, res) => {
    res.render('auth/login', {
        title: 'Login',
        errors: req.flash('error'),
        success: req.flash('success')
    });
};

const postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findByEmail(email);

        if (!user) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        const isValidPassword = await UserModel.verifyPassword(password, user.password);
        if (!isValidPassword) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        req.session.userId = user.uid;
        req.session.email = user.email;
        req.session.role = user.role;

        if (user.role === 'patient') {
            const patient = await PatientModel.findByUserId(user.uid);
            req.session.patientId = patient ? patient.pid : null;
        } else if (user.role === 'doctor') {
            const doctor = await DoctorModel.findByUserId(user.uid);
            req.session.doctorId = doctor ? doctor.did : null;
        }

        req.flash('success', `Welcome back, ${user.email}!`);
        const returnTo = req.session.returnTo || '/dashboard';
        delete req.session.returnTo;
        res.redirect(returnTo);
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect('/auth/login');
    }
};

const getRegister = (req, res) => {
    res.render('auth/register', {
        title: 'Register',
        errors: req.flash('error'),
        success: req.flash('success')
    });
};

const postRegister = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, phone, dateOfBirth, gender, address, emergencyContact, bloodType } = req.body;

        // Check if passwords match
        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match');
            return res.redirect('/auth/register');
        }

        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            req.flash('error', 'Email is already registered');
            return res.redirect('/auth/register');
        }

        const user = await UserModel.register({ email, password, role: 'patient' });

        await PatientModel.create({
            uid: user.uid,
            firstName, lastName, phone, dateOfBirth, gender, address, emergencyContact, bloodType
        });

        req.flash('success', 'Registration successful! Please login.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', error.message || 'Registration failed. Please try again.');
        res.redirect('/auth/register');
    }
};

const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error('Logout error:', err);
        res.redirect('/');
    });
};

const getForgotPassword = (req, res) => {
    res.render('auth/forgot-password', {
        title: 'Forgot Password',
        errors: req.flash('error'),
        success: req.flash('success')
    });
};

// Direct password reset (no token, no email)
const postForgotPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            req.flash('error', 'Passwords do not match.');
            return res.redirect('/auth/forgot-password');
        }

        // Optional: enforce password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            req.flash('error', 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
            return res.redirect('/auth/forgot-password');
        }

        // Find user by email
        const user = await UserModel.findByEmail(email);
        if (!user) {
            // For security, don't reveal whether email exists
            req.flash('success', 'If that email exists, the password has been reset.');
            return res.redirect('/auth/login');
        }

        // Update the password (will be hashed inside updatePassword)
        await UserModel.updatePassword(user.uid, newPassword);

        req.flash('success', 'Your password has been reset. Please login with your new password.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Forgot password error:', error);
        req.flash('error', 'Failed to reset password. Please try again.');
        res.redirect('/auth/forgot-password');
    }
};

module.exports = {
    getLogin,
    postLogin,
    getRegister,
    postRegister,
    logout,
    getForgotPassword,
    postForgotPassword
};