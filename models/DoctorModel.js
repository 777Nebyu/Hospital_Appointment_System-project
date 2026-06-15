// models/DoctorModel.js
// Doctor Model - Doctor-specific operations
// SQL Injection Prevention: All queries use parameterized queries

const pool = require('../config/db');

class DoctorModel {
    static async create(doctorData) {
        const { uid, firstName, lastName, specialization, phone, experienceYears, qualification, availabilitySchedule } = doctorData;
        try {
            const query = `
                INSERT INTO doctors (uid, first_name, last_name, specialization, phone, experience_years, qualification, availability_schedule)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `;
            const values = [uid, firstName, lastName, specialization, phone || null, experienceYears || 0, qualification || null, JSON.stringify(availabilitySchedule || [])];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating doctor:', error);
            throw new Error('Failed to create doctor profile');
        }
    }

    static async findByUserId(userId) {
        try {
            const query = `
                SELECT d.*, u.email
                FROM doctors d
                JOIN users u ON d.uid = u.uid
                WHERE d.uid = $1
            `;
            const values = [userId];
            const result = await pool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error finding doctor by user ID:', error);
            throw new Error('Database error occurred');
        }
    }

    static async findById(doctorId) {
        try {
            const query = `
                SELECT d.*, u.email
                FROM doctors d
                JOIN users u ON d.uid = u.uid
                WHERE d.did = $1
            `;
            const values = [doctorId];
            const result = await pool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error finding doctor by ID:', error);
            throw new Error('Database error occurred');
        }
    }

    static async update(doctorId, updateData) {
        const { firstName, lastName, specialization, phone, experienceYears, qualification, availabilitySchedule, isActive } = updateData;
        try {
            const query = `
                UPDATE doctors
                SET first_name = $1, last_name = $2, specialization = $3, 
                    phone = $4, experience_years = $5, qualification = $6, 
                    availability_schedule = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP
                WHERE did = $9
                RETURNING *
            `;
            const values = [firstName, lastName, specialization, phone || null, experienceYears || 0, qualification || null, JSON.stringify(availabilitySchedule || []), isActive !== undefined ? isActive : true, doctorId];
            const result = await pool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error updating doctor:', error);
            throw new Error('Failed to update doctor profile');
        }
    }

    static async getAll(filters = {}) {
        try {
            let query = `
                SELECT d.*, u.email
                FROM doctors d
                JOIN users u ON d.uid = u.uid
                WHERE 1=1
            `;
            const values = [];
            let paramCount = 0;

            if (filters.specialization) {
                paramCount++;
                query += ` AND d.specialization ILIKE $${paramCount}`;
                values.push(`%${filters.specialization}%`);
            }

            if (filters.isActive !== undefined) {
                paramCount++;
                query += ` AND d.is_active = $${paramCount}`;
                values.push(filters.isActive);
            }

            if (filters.search) {
                paramCount++;
                query += ` AND (d.first_name ILIKE $${paramCount} OR d.last_name ILIKE $${paramCount} OR d.specialization ILIKE $${paramCount})`;
                values.push(`%${filters.search}%`);
            }

            query += ' ORDER BY d.created_at DESC';
            const result = await pool.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('Error getting all doctors:', error);
            throw new Error('Failed to retrieve doctors');
        }
    }

    static async searchBySpecialization(specialization) {
        try {
            const query = `
                SELECT d.*, u.email
                FROM doctors d
                JOIN users u ON d.uid = u.uid
                WHERE d.specialization ILIKE $1 AND d.is_active = true
                ORDER BY d.experience_years DESC
            `;
            const values = [`%${specialization}%`];
            const result = await pool.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('Error searching doctors:', error);
            throw new Error('Failed to search doctors');
        }
    }

    static async delete(doctorId) {
        try {
            const query = 'DELETE FROM doctors WHERE did = $1 RETURNING did';
            const values = [doctorId];
            const result = await pool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error deleting doctor:', error);
            throw new Error('Failed to delete doctor');
        }
    }

    static async getCount() {
        try {
            const query = 'SELECT COUNT(*) as count FROM doctors';
            const result = await pool.query(query);
            return parseInt(result.rows[0].count);
        } catch (error) {
            console.error('Error getting doctor count:', error);
            throw new Error('Failed to retrieve doctor count');
        }
    }
}

module.exports = DoctorModel;
