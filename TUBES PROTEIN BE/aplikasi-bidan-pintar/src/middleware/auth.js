/**
 * Middleware Autentikasi
 * Verifikasi token JWT
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/constant');
const { unauthorized, forbidden } = require('../utils/response');

/**
 * Verifikasi token JWT dari header Authorization
 * Format token: Bearer <token>
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Cek apakah header authorization ada dan formatnya benar
  if (!authHeader?.startsWith('Bearer ')) {
    return unauthorized(res, 'Token tidak ditemukan atau format salah');
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verifikasi dan decode token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Lampirkan data user ke objek request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email
    };

    // VERIFIKASI DB: Pastikan user masih ada (mencegah error audit log jika DB di-reset)
    const db = require('../config/database');
    const [userExists] = await db.query('SELECT id_user FROM users WHERE id_user = ?', [decoded.id]);

    if (userExists.length === 0) {
      return forbidden(res, 'User tidak ditemukan (Token Stale). Silakan login kembali.');
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return forbidden(res, 'Token sudah kadaluarsa. Silakan login kembali.');
    }
    return forbidden(res, 'Token tidak valid');
  }
};

/**
 * Autentikasi Opsional - tidak gagal jika tidak ada token
 * Berguna untuk rute yang bisa bekerja dengan atau tanpa login
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email
    };
  } catch (error) {
    // Abaikan error token untuk auth opsional
  }

  next();
};

module.exports = {
  verifyToken,
  optionalAuth
};