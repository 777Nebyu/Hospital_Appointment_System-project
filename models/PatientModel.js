// models/PatientModel.js
// Patient Model - Patient-specific operations
// SQL Injection Prevention: All queries use parameterized queries

const pool = require('../config/db');

class PatientModel {
    static async create(patientData) {
        const { uid, firstName, lastName, phone, dateOfBirth, gender, address, emergencyContact, bloodType } = patientData;
        try {
            const query = `
                INSERT INTO patients (uid, first_name, last_name, phone, date_of_birth, gender, address, emergency_contact, blood_type)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;
            const values = [uid, firstName, lastName, phone || null, dateOfBirth || null, gender || null, address || null, emergencyContact || null, bloodType || null];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating patient:', error);
            throw new Error('Failed to create patient profile');
        }
    }

    static async findByUserId(userId) {
        try {
            const query = `
                SELECT p.*, u.email
                FROM patients p
                JOIN users u ON p.uid = u.uid
                WHERE p.uid = $1
            `;
            const values = [userId];
            const result = await pool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error finding patient by user ID:', error);
            throw new Error('Database error occurred');
        }
    }

    static async findById(patientId) {
        try {
            const query = `
                SELECT p.*, u.email
                FROM patients p
                JOIN users u ON p.uid = u.uid
                WHERE p.pid = $1
            `;
            const values = [patientId];
            const result = await pool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error finding patient by ID:', error);
            throw new Error('Database error occurred');
        }
    }

    static async update(patientId, updateData) {
        const { firstName, lastName, phone, dateOfBirth, gender, address, emergencyContact, bloodType } = updateData;
        try {
            const query = `
                UPDATE patients
                SET first_name = $1, last_name = $2, phone = $3, 
                    date_of_birth = $4, gender = $5, address = $6, 
                    emergency_contact = $7, blood_type = $8, updated_at = CURRENT_TIMESTAMP
                WHERE pid = $9
                RETURNING *
            `;
            const values = [firstName, lastName, phone || null, dateOfBirth || null, gender || null, address || null, emergencyContact || null, bloodType || null, patientId];
            const result = await pool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error updating patient:', error);
            throw new Error('Failed to update patient profile');
        }
    }

    static async getAll() {
        try {
            const query = `
                SELECT p.*, u.email
                FROM patients p
                JOIN users u ON p.uid = u.uid
                ORDER BY p.created_at DESC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error getting all patients:', error);
            throw new Error('Failed to retrieve patients');
        }
    }

    static async delete(patientId) {
        try {
            const query = 'DELETE FROM patients WHERE pid = $1 RETURNING pid';
            const values = [patientId];
            const result = await pool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error deleting patient:', error);
            throw new Error('Failed to delete patient');
        }
    }

    static async getCount() {
        try {
            const query = 'SELECT COUNT(*) as count FROM patients';
            const result = await pool.query(query);
            return parseInt(result.rows[0].count);
        } catch (error) {
            console.error('Error getting patient count:', error);
            throw new Error('Failed to retrieve patient count');
        }
    }
}

module.exports = PatientModel;
