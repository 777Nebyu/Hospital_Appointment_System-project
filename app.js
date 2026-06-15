// app.js
// Hospital Appointment System - Main Application Entry Point
// Security: Helmet, Rate Limiting, XSS Protection, Session Management, CSRF Protection

const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
const flash = require('connect-flash');

const pool = require('./config/db');

const {
    helmetConfig,
    generalLimiter,
    apiLimiter,
    xssSanitizer,
    ssrfPrevention,
    errorHandler,
    notFoundHandler
} = require('./middleware/security');

const { loadUser } = require('./middleware/authMiddleware');
const { logRequest } = require('./middleware/logger');

const mainRoutes = require('./routes/mainRoutes');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');

require('dotenv').config();

const app = express();

// 1. Helmet - Security headers
app.use(helmetConfig);

// 2. Rate Limiting - DDoS prevention
app.use(generalLimiter);

// 3. Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. XSS Sanitizer
app.use(xssSanitizer);

// 5. SSRF Prevention
app.use(ssrfPrevention);

// 6. Request Logging
app.use(logRequest);

// 7. Session Management
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'user_sessions',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'fallback_secret_change_this',
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict'
    }
}));

// 8. Flash Messages
app.use(flash());

// 9. Load user data into locals
app.use(loadUser);
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.userRole = req.session?.role || null;
    res.locals.userId = req.session?.userId || null;
    res.locals.flashError = req.flash('error');
    res.locals.flashSuccess = req.flash('success');
    next();
});

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// API Rate Limiting
app.use('/api', apiLimiter);

// Routes
app.use('/', mainRoutes);
app.use('/auth', authRoutes);
app.use('/patient', patientRoutes);
app.use('/doctor', doctorRoutes);
app.use('/admin', adminRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('Hospital Appointment System running on port ' + PORT);
    console.log('Environment: ' + (process.env.NODE_ENV || 'development'));
    console.log('Database: PostgreSQL');
    console.log('Security: Helmet + Rate Limiting + XSS Protection + SSRF Prevention');
});

module.exports = app;