// models/AppointmentModel.js
// Appointment Model - Appointment CRUD operations
// SQL Injection Prevention: All queries use parameterized queries

const pool = require('../config/db');

class AppointmentModel {
    static async create(appointmentData) {
        const { patientId, doctorId, appointmentDate, appointmentTime, reason } = appointmentData;
        try {
            const query = `
                INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status)
                VALUES ($1, $2, $3, $4, $5, 'pending')
                RETURNING *
            `;
            const values = [patientId, doctorId, appointmentDate, appointmentTime, reason];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw new Error('Failed to create appointment');
        }
    }

    static async findById(appointmentId) {
        try {
            const query = `
                SELECT a.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, p.phone as patient_phone,
                       d.first_name as doctor_first_name, d.last_name as doctor_last_name, d.specialization,
                       u_p.email as patient_email, u_d.email as doctor_email
                FROM appointments a
                JOIN patients p ON a.patient_id = p.pid
                JOIN doctors d ON a.doctor_id = d.did
                JOIN users u_p ON p.uid = u_p.uid
                JOIN users u_d ON d.uid = u_d.uid
                WHERE a.aid = $1
            `;
            const values = [appointmentId];
            const result = await pool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error finding appointment:', error);
            throw new Error('Database error occurred');
        }
    }

    static async getByPatient(patientId) {
        try {
            const query = `
                SELECT a.*, 
                       d.first_name as doctor_first_name, d.last_name as doctor_last_name, d.specialization
                FROM appointments a
                JOIN doctors d ON a.doctor_id = d.did
                WHERE a.patient_id = $1
                ORDER BY a.appointment_date DESC, a.appointment_time DESC
            `;
            const values = [patientId];
            const result = await pool.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('Error getting patient appointments:', error);
            throw new Error('Failed to retrieve appointments');
        }
    }

    static async getByDoctor(doctorId) {
        try {
            const query = `
                SELECT a.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, p.phone as patient_phone
                FROM appointments a
                JOIN patients p ON a.patient_id = p.pid
                WHERE a.doctor_id = $1
                ORDER BY a.appointment_date DESC, a.appointment_time DESC
            `;
            const values = [doctorId];
            const result = await pool.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('Error getting doctor appointments:', error);
            throw new Error('Failed to retrieve appointments');
        }
    }

    static async getAll(filters = {}) {
        try {
            let query = `
                SELECT a.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name,
                       d.first_name as doctor_first_name, d.last_name as doctor_last_name, d.specialization
                FROM appointments a
                JOIN patients p ON a.patient_id = p.pid
                JOIN doctors d ON a.doctor_id = d.did
                WHERE 1=1
            `;
            const values = [];
            let paramCount = 0;

            if (filters.status) {
                paramCount++;
                query += ` AND a.status = $${paramCount}`;
                values.push(filters.status);
            }
            if (filters.doctorId) {
                paramCount++;
                query += ` AND a.doctor_id = $${paramCount}`;
                values.push(filters.doctorId);
            }
            if (filters.patientId) {
                paramCount++;
                query += ` AND a.patient_id = $${paramCount}`;
                values.push(filters.patientId);
            }
            if (filters.dateFrom) {
                paramCount++;
                query += ` AND a.appointment_date >= $${paramCount}`;
                values.push(filters.dateFrom);
            }
            if (filters.dateTo) {
                paramCount++;
                query += ` AND a.appointment_date <= $${paramCount}`;
                values.push(filters.dateTo);
            }

            query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';
            const result = await pool.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('Error getting all appointments:', error);
            throw new Error('Failed to retrieve appointments');
        }
    }

    static async updateStatus(appointmentId, status, notes = null) {
        try {
            const query = `
                UPDATE appointments
                SET status = $1, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
                WHERE aid = $3
                RETURNING *
            `;
            const values = [status, notes, appointmentId];
            const result = await pool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error updating appointment status:', error);
            throw new Error('Failed to update appointment status');
        }
    }

    static async update(appointmentId, updateData) {
        const { appointmentDate, appointmentTime, reason } = updateData;
        try {
            const query = `
                UPDATE appointments
                SET appointment_date = $1, appointment_time = $2, reason = $3, updated_at = CURRENT_TIMESTAMP
                WHERE aid = $4 AND status = 'pending'
                RETURNING *
            `;
            const values = [appointmentDate, appointmentTime, reason, appointmentId];
            const result = await pool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error updating appointment:', error);
            throw new Error('Failed to update appointment');
        }
    }

    static async cancel(appointmentId) {
        try {
            const query = `
                UPDATE appointments
                SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
                WHERE aid = $1 AND status IN ('pending', 'approved')
                RETURNING *
            `;
            const values = [appointmentId];
            const result = await pool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            throw new Error('Failed to cancel appointment');
        }
    }

    static async delete(appointmentId) {
        try {
            const query = 'DELETE FROM appointments WHERE aid = $1 RETURNING aid';
            const values = [appointmentId];
            const result = await pool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error deleting appointment:', error);
            throw new Error('Failed to delete appointment');
        }
    }

    static async getCountsByStatus() {
        try {
            const query = `SELECT status, COUNT(*) as count FROM appointments GROUP BY status`;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error getting appointment counts:', error);
            throw new Error('Failed to retrieve appointment counts');
        }
    }

    static async getCount() {
        try {
            const query = 'SELECT COUNT(*) as count FROM appointments';
            const result = await pool.query(query);
            return parseInt(result.rows[0].count);
        } catch (error) {
            console.error('Error getting appointment count:', error);
            throw new Error('Failed to retrieve appointment count');
        }
    }

    static async getTodayAppointments(doctorId) {
        try {
            const query = `
                SELECT a.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, p.phone as patient_phone
                FROM appointments a
                JOIN patients p ON a.patient_id = p.pid
                WHERE a.doctor_id = $1 AND a.appointment_date = CURRENT_DATE AND a.status IN ('pending', 'approved')
                ORDER BY a.appointment_time ASC
            `;
            const values = [doctorId];
            const result = await pool.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('Error getting today appointments:', error);
            throw new Error('Failed to retrieve today appointments');
        }
    }

    static async isTimeSlotAvailable(doctorId, date, time) {
        try {
            const query = `
                SELECT COUNT(*) as count
                FROM appointments
                WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3
                AND status IN ('pending', 'approved')
            `;
            const values = [doctorId, date, time];
            const result = await pool.query(query, values);
            return parseInt(result.rows[0].count) === 0;
        } catch (error) {
            console.error('Error checking time slot:', error);
            throw new Error('Failed to check time slot availability');
        }
    }
}

module.exports = AppointmentModel;
