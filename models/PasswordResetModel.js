// models/PasswordResetModel.js
// Password Reset Model - Forgot password functionality
// SQL Injection Prevention: All queries use parameterized queries

const pool = require('../config/db');
const crypto = require('crypto');

class PasswordResetModel {
    static async createToken(email) {
        try {
            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 3600000);

            await pool.query(
                'UPDATE password_resets SET used = true WHERE email = $1 AND used = false',
                [email.toLowerCase().trim()]
            );

            const query = `
                INSERT INTO password_resets (email, token, expires_at)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const values = [email.toLowerCase().trim(), token, expiresAt];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating reset token:', error);
            throw new Error('Failed to create password reset token');
        }
    }

    static async findValidToken(token) {
        try {
            const query = `
                SELECT * FROM password_resets
                WHERE token = $1 AND used = false AND expires_at > CURRENT_TIMESTAMP
            `;
            const values = [token];
            const result = await pool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error finding reset token:', error);
            throw new Error('Failed to verify reset token');
        }
    }

    static async markUsed(token) {
        try {
            const query = `
                UPDATE password_resets
                SET used = true
                WHERE token = $1
                RETURNING *
            `;
            const values = [token];
            const result = await pool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error marking token used:', error);
            throw new Error('Failed to update reset token');
        }
    }

    static async cleanupExpired() {
        try {
            const query = `
                DELETE FROM password_resets
                WHERE expires_at < CURRENT_TIMESTAMP OR used = true
            `;
            await pool.query(query);
            return true;
        } catch (error) {
            console.error('Error cleaning up tokens:', error);
            throw new Error('Failed to cleanup expired tokens');
        }
    }
}

module.exports = PasswordResetModel;