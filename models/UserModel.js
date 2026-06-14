// models/UserModel.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');

class UserModel {
    // Find user by email
    static async findByEmail(email) {
        try {
            const query = 'SELECT * FROM users WHERE email = $1';
            const result = await pool.query(query, [email.toLowerCase().trim()]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw new Error('Database error');
        }
    }

    // Find user by ID
    static async findById(uid) {
        try {
            const query = 'SELECT * FROM users WHERE uid = $1';
            const result = await pool.query(query, [uid]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw new Error('Database error');
        }
    }

    // Register new user (hashes password)
    static async register({ email, password, role }) {
        try {
            const hashedPassword = await bcrypt.hash(password, 12);
            const query = `
                INSERT INTO users (email, password, role)
                VALUES ($1, $2, $3)
                RETURNING uid, email, role
            `;
            const values = [email.toLowerCase().trim(), hashedPassword, role];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error registering user:', error);
            throw new Error('Failed to create user');
        }
    }

    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error('Error verifying password:', error);
            return false;
        }
    }

    // Update password (with hashing)
    static async updatePassword(uid, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            const query = `
                UPDATE users 
                SET password = $1, updated_at = CURRENT_TIMESTAMP
                WHERE uid = $2
                RETURNING uid
            `;
            const result = await pool.query(query, [hashedPassword, uid]);
            if (result.rowCount === 0) {
                throw new Error('User not found');
            }
            return true;
        } catch (error) {
            console.error('Error updating password:', error);
            throw new Error('Failed to update password');
        }
    }

    // Delete user
    static async delete(uid) {
        try {
            const query = 'DELETE FROM users WHERE uid = $1 RETURNING uid';
            const result = await pool.query(query, [uid]);
            return result.rowCount > 0;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw new Error('Failed to delete user');
        }
    }
}

module.exports = UserModel;