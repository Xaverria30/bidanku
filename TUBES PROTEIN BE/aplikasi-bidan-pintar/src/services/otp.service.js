/**
 * Service OTP
 * Menangani pembuatan, validasi, dan pengiriman OTP
 */

const db = require('../config/database');
const mailer = require('../utils/mailer');
const { OTP_EXPIRY_MINUTES } = require('../utils/constant');
const crypto = require('crypto');

/**
 * Buat kode OTP random 6 digit
 * @returns {string} Kode OTP 6 digit
 */
const generateOTPCode = () => {
  return crypto.randomInt(100000, 999999 + 1).toString();
};

/**
 * Simpan OTP ke database dan kirim via email
 * @param {string} id_user - ID User
 * @param {string} email - Email User
 * @returns {Object} Status sukses
 */
const saveAndSendOTP = async (id_user, email) => {
  const otpCode = generateOTPCode();

  // Simpan OTP dengan waktu kedaluwarsa (menggunakan waktu database untuk konsistensi)
  const query = `
    INSERT INTO otp_codes (id_user, otp_code, expires_at)
    VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))
    ON DUPLICATE KEY UPDATE
      otp_code = VALUES(otp_code),
      expires_at = VALUES(expires_at),
      created_at = CURRENT_TIMESTAMP
  `;

  await db.query(query, [id_user, otpCode, OTP_EXPIRY_MINUTES + 1]);

  // Coba kirim email (non-blocking)
  try {
    await mailer.sendOTP(email, otpCode);
  } catch (emailError) {
    console.warn('[OTP] Email gagal dikirim tapi OTP tersimpan:', emailError.message);
    // Dalam mode development, log kode OTP untuk testing
    if (process.env.NODE_ENV === 'development') {
      console.log('[OTP] Code for testing:', otpCode);
    }
  }

  return { success: true };
};

/**
 * Validasi kode OTP user
 * @param {Object} user - Objek User dengan id_user
 * @param {string} otp_code - Kode OTP yang akan divalidasi
 * @returns {boolean} True jika valid
 * @throws {Error} Jika OTP tidak valid atau kedaluwarsa
 */
const validateOTP = async (user, otp_code) => {
  // Ambil data OTP dengan cek validitas waktu
  const [rows] = await db.query(
    `SELECT otp_code, expires_at, (expires_at > NOW()) AS is_valid 
     FROM otp_codes WHERE id_user = ?`,
    [user.id_user]
  );

  const otpData = rows[0];

  if (!otpData) {
    throw new Error('Kode OTP tidak ditemukan. Silakan login ulang.');
  }

  // Cek kedaluwarsa
  if (!otpData.is_valid) {
    await deleteOTP(user.id_user);
    throw new Error('Kode OTP sudah kedaluwarsa. Silakan kirim ulang.');
  }

  // Cek kecocokan kode
  if (otpData.otp_code !== otp_code) {
    throw new Error('Kode OTP salah.');
  }

  // Hapus OTP setelah validasi sukses
  await deleteOTP(user.id_user);

  return true;
};

/**
 * Hapus OTP User
 * @param {string} id_user - ID User
 */
const deleteOTP = async (id_user) => {
  try {
    await db.query('DELETE FROM otp_codes WHERE id_user = ?', [id_user]);
  } catch (error) {
    console.error('[OTP] Gagal menghapus:', error.message);
  }
};

module.exports = {
  saveAndSendOTP,
  validateOTP,
  deleteOTP
};
