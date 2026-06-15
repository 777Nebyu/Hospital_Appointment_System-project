// scripts/initDatabase.js
// Database Initialization Script
// Creates all tables with proper constraints and indexes

const pool = require('../config/db');

const initDatabase = async () => {
    try {
        console.log('Initializing database...');

        await pool.query(`
            DROP TABLE IF EXISTS password_resets CASCADE;
            DROP TABLE IF EXISTS appointments CASCADE;
            DROP TABLE IF EXISTS doctors CASCADE;
            DROP TABLE IF EXISTS patients CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        `);

        await pool.query(`
            CREATE TABLE users (
                uid SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE patients (
                pid SERIAL PRIMARY KEY,
                uid INTEGER REFERENCES users(uid) ON DELETE CASCADE,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                date_of_birth DATE,
                gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
                address TEXT,
                emergency_contact VARCHAR(100),
                blood_type VARCHAR(5),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE doctors (
                did SERIAL PRIMARY KEY,
                uid INTEGER REFERENCES users(uid) ON DELETE CASCADE,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                specialization VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                experience_years INTEGER DEFAULT 0,
                qualification TEXT,
                availability_schedule JSONB DEFAULT '[]',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE appointments (
                aid SERIAL PRIMARY KEY,
                patient_id INTEGER REFERENCES patients(pid) ON DELETE CASCADE,
                doctor_id INTEGER REFERENCES doctors(did) ON DELETE CASCADE,
                appointment_date DATE NOT NULL,
                appointment_time TIME NOT NULL,
                reason TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE password_resets (
                rid SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                token VARCHAR(255) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                used BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`CREATE INDEX idx_users_email ON users(email);`);
        await pool.query(`CREATE INDEX idx_users_role ON users(role);`);
        await pool.query(`CREATE INDEX idx_patients_uid ON patients(uid);`);
        await pool.query(`CREATE INDEX idx_doctors_uid ON doctors(uid);`);
        await pool.query(`CREATE INDEX idx_doctors_specialization ON doctors(specialization);`);
        await pool.query(`CREATE INDEX idx_appointments_patient ON appointments(patient_id);`);
        await pool.query(`CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);`);
        await pool.query(`CREATE INDEX idx_appointments_status ON appointments(status);`);
        await pool.query(`CREATE INDEX idx_appointments_date ON appointments(appointment_date);`);

        const bcrypt = require('bcrypt');
        const adminPassword = await bcrypt.hash('admin123', 12);

        await pool.query(`
            INSERT INTO users (email, password, role)
            VALUES ($1, $2, $3)
            RETURNING uid;
        `, ['admin@hospital.com', adminPassword, 'admin']);

        console.log('Database initialized successfully!');
        console.log('Default admin: admin@hospital.com / admin123');
        console.log('Please change the default admin password after first login!');

    } catch (error) {
        console.error('Database initialization failed:', error);
    } finally {
        await pool.end();
    }
};

initDatabase();
