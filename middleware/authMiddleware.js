// middleware/authMiddleware.js
// Authentication & Authorization Middleware

const pool = require('../config/db');

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Please login.'
        });
    }
    req.session.returnTo = req.originalUrl;
    res.redirect('/auth/login');
};

const hasRole = (...roles) => {
    return (req, res, next) => {
        if (!req.session || !req.session.userId) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(401).json({ success: false, message: 'Authentication required.' });
            }
            return res.redirect('/auth/login');
        }
        if (!roles.includes(req.session.role)) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(403).json({ success: false, message: 'Access denied. Insufficient permissions.' });
            }
            return res.status(403).render('error', {
                title: 'Access Denied',
                message: 'You do not have permission to access this page.',
                status: 403
            });
        }
        next();
    };
};

const isPatient = hasRole('patient');
const isDoctor = hasRole('doctor');
const isAdmin = hasRole('admin');
const isPatientOrAdmin = hasRole('patient', 'admin');
const isDoctorOrAdmin = hasRole('doctor', 'admin');

const loadUser = async (req, res, next) => {
    if (req.session && req.session.userId) {
        try {
            const result = await pool.query(
                'SELECT uid, email, role FROM users WHERE uid = $1',
                [req.session.userId]
            );
            if (result.rows.length > 0) {
                req.user = result.rows[0];
            }
        } catch (error) {
            console.error('Error loading user:', error);
        }
    }
    next();
};

const redirectIfAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return res.redirect('/dashboard');
    }
    next();
};

module.exports = {
    isAuthenticated,
    hasRole,
    isPatient,
    isDoctor,
    isAdmin,
    isPatientOrAdmin,
    isDoctorOrAdmin,
    loadUser,
    redirectIfAuthenticated
};
