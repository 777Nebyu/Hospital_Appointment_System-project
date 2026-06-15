// middleware/security.js
// Security Middleware Configuration
// Implements: Helmet, Rate Limiting, XSS Protection, Input Validation, SSRF Prevention

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult, param, query } = require('express-validator');

// 1. HELMET - Security Headers
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

// 2. RATE LIMITING - DDoS & Brute Force Prevention
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).render('error', {
            title: 'Rate Limited',
            message: 'Too many requests. Please try again later.',
            status: 429
        });
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).render('error', {
            title: 'Too Many Attempts',
            message: 'Too many login attempts. Please try again after 15 minutes.',
            status: 429
        });
    }
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: { error: 'API rate limit exceeded. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// 3. INPUT VALIDATION & SANITIZATION (XSS Prevention)
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const sanitizedErrors = errors.array().map(err => ({
            ...err,
            msg: err.msg.replace(/[<>]/g, '')
        }));
        return res.status(400).json({
            success: false,
            errors: sanitizedErrors
        });
    }
    next();
};

const validateRegistration = [
    body('firstName').trim().isLength({ min: 2, max: 50 }).matches(/^[a-zA-Z\s]+$/).withMessage('First name must be 2-50 characters, letters only'),
    body('lastName').trim().isLength({ min: 2, max: 50 }).matches(/^[a-zA-Z\s]+$/).withMessage('Last name must be 2-50 characters, letters only'),
    body('email').trim().isEmail().normalizeEmail().isLength({ max: 255 }).withMessage('Valid email is required'),
    body('password').isLength({ min: 8, max: 128 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).withMessage('Password must be 8+ chars with uppercase, lowercase, number, and special char'),
    body('phone').optional().trim().matches(/^[+]?[\d\s-]+$/).withMessage('Invalid phone number format'),
    body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender selection'),
    handleValidationErrors
];

const validateLogin = [
    body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 1 }).withMessage('Password is required'),
    handleValidationErrors
];

const validateAppointment = [
    body('doctorId').isInt({ min: 1 }).withMessage('Valid doctor ID is required'),
    body('appointmentDate').isISO8601().isAfter(new Date().toISOString()).withMessage('Appointment date must be in the future'),
    body('appointmentTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format (HH:MM) is required'),
    body('reason').trim().isLength({ min: 5, max: 500 }).escape().withMessage('Reason must be 5-500 characters'),
    handleValidationErrors
];

const validateDoctor = [
    body('firstName').trim().isLength({ min: 2, max: 50 }).matches(/^[a-zA-Z\s]+$/).withMessage('First name must be 2-50 characters, letters only'),
    body('lastName').trim().isLength({ min: 2, max: 50 }).matches(/^[a-zA-Z\s]+$/).withMessage('Last name must be 2-50 characters, letters only'),
    body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('specialization').trim().isLength({ min: 2, max: 100 }).matches(/^[a-zA-Z\s,]+$/).withMessage('Valid specialization is required'),
    body('phone').optional().trim().matches(/^[+]?[\d\s-]+$/).withMessage('Invalid phone number format'),
    body('experienceYears').optional().isInt({ min: 0, max: 70 }).withMessage('Experience must be 0-70 years'),
    handleValidationErrors
];

const validateId = [
    param('id').isInt({ min: 1 }).withMessage('Invalid ID format'),
    handleValidationErrors
];

const validateSearch = [
    query('q').optional().trim().isLength({ min: 1, max: 100 }).escape().withMessage('Search query must be 1-100 characters'),
    query('specialization').optional().trim().isLength({ min: 1, max: 100 }).matches(/^[a-zA-Z\s,]+$/).withMessage('Invalid specialization filter'),
    handleValidationErrors
];

const validatePasswordReset = [
    body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('newPassword').isLength({ min: 8, max: 128 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).withMessage('Password must be 8+ chars with uppercase, lowercase, number, and special char'),
    handleValidationErrors
];

// 4. XSS PROTECTION MIDDLEWARE
const xssSanitizer = (req, res, next) => {
    if (req.body) {
        const sanitize = (obj) => {
            for (let key in obj) {
                if (typeof obj[key] === 'string') {
                    obj[key] = obj[key]
                        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                        .replace(/javascript:/gi, '')
                        .replace(/on\w+\s*=/gi, '');
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    sanitize(obj[key]);
                }
            }
        };
        sanitize(req.body);
    }
    next();
};

// 5. SSRF PREVENTION - URL Validation
const ssrfPrevention = (req, res, next) => {
    const blockedHosts = [
        'localhost', '127.0.0.1', '0.0.0.0', '::1',
        '10.', '172.16.', '172.17.', '172.18.', '172.19.',
        '172.20.', '172.21.', '172.22.', '172.23.', '172.24.',
        '172.25.', '172.26.', '172.27.', '172.28.', '172.29.',
        '172.30.', '172.31.', '192.168.'
    ];

    const checkUrl = (url) => {
        if (!url) return true;
        try {
            const parsed = new URL(url);
            const hostname = parsed.hostname.toLowerCase();
            return !blockedHosts.some(blocked => hostname.startsWith(blocked) || hostname === blocked);
        } catch {
            return false;
        }
    };

    const urlsToCheck = [
        req.body?.url,
        req.body?.callback,
        req.body?.redirect,
        req.query?.url,
        req.query?.redirect
    ];

    for (const url of urlsToCheck) {
        if (url && !checkUrl(url)) {
            return res.status(403).json({
                success: false,
                message: 'Access to internal resources is not allowed'
            });
        }
    }
    next();
};

// 6. ERROR HANDLING MIDDLEWARE
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    const isDev = process.env.NODE_ENV === 'development';

    if (err.name === 'UnauthorizedError') {
        return res.status(401).render('error', {
            title: 'Unauthorized',
            message: 'You are not authorized to access this resource.',
            status: 401
        });
    }

    res.status(err.status || 500).render('error', {
        title: 'Error',
        message: isDev ? err.message : 'Something went wrong. Please try again later.',
        status: err.status || 500,
        stack: isDev ? err.stack : null
    });
};

const notFoundHandler = (req, res) => {
    res.status(404).render('error', {
        title: 'Page Not Found',
        message: 'The page you are looking for does not exist.',
        status: 404
    });
};

module.exports = {
    helmetConfig,
    generalLimiter,
    authLimiter,
    apiLimiter,
    validateRegistration,
    validateLogin,
    validateAppointment,
    validateDoctor,
    validateId,
    validateSearch,
    validatePasswordReset,
    xssSanitizer,
    ssrfPrevention,
    errorHandler,
    notFoundHandler,
    handleValidationErrors
};
