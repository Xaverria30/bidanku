/**
 * Service Autentikasi
 * Menangani autentikasi user, registrasi, dan manajemen profil
 */

const db = require('../config/database');
const otpService = require('./otp.service');
const auditService = require('./audit.service');

/**
 * Cari user berdasarkan username atau email (termasuk password untuk auth)
 * @param {string} identifier - Username atau email
 * @returns {Object|null} Data user dengan password
 */
const getUserByUsernameOrEmail = async (identifier) => {
  const query = `
    SELECT id_user, nama_lengkap, username, email, password, is_verified
    FROM users 
    WHERE username = ? OR email = ?
  `;
  const [rows] = await db.query(query, [identifier, identifier]);
  return rows[0] || null;
};

/**
 * Cari user berdasarkan ID (tanpa password)
 * @param {string} id_user - ID User
 * @returns {Object|null} Data user
 */
const getUserById = async (id_user) => {
  const query = `
    SELECT id_user, nama_lengkap, username, email, is_verified, created_at
    FROM users 
    WHERE id_user = ?
  `;
  const [rows] = await db.query(query, [id_user]);
  return rows[0] || null;
};

/**
 * Cari user berdasarkan email (untuk reset password)
 * @param {string} email - Email user
 * @returns {Object|null} Data user
 */
const getUserByEmail = async (email) => {
  const query = `
    SELECT id_user, nama_lengkap, username, email, is_verified
    FROM users 
    WHERE email = ?
  `;
  const [rows] = await db.query(query, [email]);
  return rows[0] || null;
};

/**
 * Registrasi user baru
 * @param {string} id_user - ID User (UUID)
 * @param {string} nama_lengkap - Nama lengkap
 * @param {string} username - Username
 * @param {string} email - Alamat email
 * @param {string} hashedPassword - Password yang sudah di-hash (bcrypt)
 * @returns {Object} Data user yang dibuat
 */
const registerUser = async (id_user, nama_lengkap, username, email, hashedPassword) => {
  const query = `
    INSERT INTO users (id_user, nama_lengkap, username, email, password, is_verified) 
    VALUES (?, ?, ?, ?, ?, 1)
  `;

  await db.query(query, [id_user, nama_lengkap, username, email, hashedPassword]);

  return { id_user, nama_lengkap, username, email };
};

/**
 * Proses login dan kirim OTP
 * @param {Object} user - Objek user
 * @param {string} ipAddress - Alamat IP klien
 * @returns {Object} Hasil login dengan pesan
 */
const loginUser = async (user, ipAddress) => {
  // Catat percobaan login yang berhasil
  await auditService.recordLoginAttempt(user.id_user, user.username, 'BERHASIL', ipAddress);

  // Generate dan kirim OTP
  await otpService.saveAndSendOTP(user.id_user, user.email);

  return {
    message: `Kode verifikasi (OTP) telah dikirimkan ke email ${user.email}`
  };
};

/**
 * Verifikasi kode OTP
 * @param {Object} user - Objek user
 * @param {string} otp_code - Kode OTP untuk diverifikasi
 * @returns {Object} Data user yang terverifikasi
 */
const verifyOTP = async (user, otp_code) => {
  await otpService.validateOTP(user, otp_code);
  return getUserById(user.id_user);
};

/**
 * Update profil user
 * @param {string} id_user - ID User
 * @param {Object} data - Data profil yang akan diupdate
 * @param {string|null} hashedPassword - Password baru (opsional)
 * @returns {Object} Data user yang sudah diupdate
 */
const updateProfile = async (id_user, data, hashedPassword = null) => {
  const { nama_lengkap, username, email } = data;

  const fields = [];
  const params = [];

  // Hanya update kolom yang disediakan
  if (nama_lengkap !== undefined) {
    fields.push('nama_lengkap = ?');
    params.push(nama_lengkap);
  }

  if (username !== undefined) {
    fields.push('username = ?');
    params.push(username);
  }

  if (email !== undefined) {
    fields.push('email = ?');
    params.push(email);
  }

  if (hashedPassword) {
    fields.push('password = ?');
    params.push(hashedPassword);
  }

  // Jika tidak ada yang diupdate, kembalikan data user saat ini
  if (fields.length === 0) {
    return getUserById(id_user);
  }

  params.push(id_user);

  const query = `UPDATE users SET ${fields.join(', ')} WHERE id_user = ?`;

  await db.query(query, params);

  // Kembalikan data user yang sudah diupdate
  return getUserById(id_user);
};

/**
 * Update password user
 * @param {string} id_user - ID User
 * @param {string} hashedPassword - Password baru yang sudah di-hash
 */
const updatePassword = async (id_user, hashedPassword) => {
  const query = 'UPDATE users SET password = ? WHERE id_user = ?';
  await db.query(query, [hashedPassword, id_user]);
};

/**
 * Ambil semua user aktif (bidan)
 * @returns {Array} Array user aktif
 */
const getAllActiveUsers = async () => {
  const query = `
    SELECT 
      id_user,
      nama_lengkap,
      username,
      email,
      is_verified,
      created_at,
      updated_at
    FROM users
    WHERE is_verified = 1
    ORDER BY nama_lengkap ASC
  `;
  const [rows] = await db.query(query);
  return rows;
};

module.exports = {
  getUserByUsernameOrEmail,
  getUserById,
  getUserByEmail,
  registerUser,
  loginUser,
  verifyOTP,
  updateProfile,
  updatePassword,
  getAllActiveUsers
};
