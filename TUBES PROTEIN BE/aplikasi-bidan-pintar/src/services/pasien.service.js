/**
 * Service Pasien
 * Menangani semua operasi database terkait pasien
 */

const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const auditService = require('./audit.service');

/**
 * Ambil semua pasien dengan pencarian opsional
 * @param {string} search - Kata kunci pencarian nama atau NIK
 * @returns {Array} Daftar pasien
 */
const getAllPasien = async (search = null) => {
  let query = 'SELECT * FROM pasien';
  const params = [];

  if (search) {
    query += ' WHERE nama LIKE ? OR nik LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC';

  const [rows] = await db.query(query, params);
  return rows;
};

/**
 * Ambil pasien berdasarkan ID
 * @param {string} id - ID Pasien
 * @returns {Object|null} Data pasien
 */
const getPasienById = async (id) => {
  const query = 'SELECT * FROM pasien WHERE id_pasien = ?';
  const [rows] = await db.query(query, [id]);
  return rows[0] || null;
};

/**
 * Buat pasien baru
 * @param {Object} data - Data pasien
 * @param {string} userId - ID pengguna yang melakukan aksi
 * @returns {Object} Data pasien yang dibuat
 */
const createPasien = async (data, userId) => {
  const { nama, NIK, umur, alamat, no_hp } = data;
  const id_pasien = uuidv4();

  const query = `
    INSERT INTO pasien (id_pasien, nama, nik, umur, alamat, no_hp) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  await db.query(query, [id_pasien, nama, NIK, umur, alamat, no_hp]);
  await auditService.recordDataLog(userId, 'CREATE', 'pasien', id_pasien);

  return { id_pasien, nama, NIK, umur, alamat, no_hp };
};

/**
 * Update data pasien
 * @param {string} id - ID Pasien
 * @param {string} userId - ID pengguna yang melakukan aksi
 * @param {Object} data - Data pasien yang diupdate
 * @returns {Object} Data pasien yang sudah diupdate
 */
const updatePasien = async (id, userId, data) => {
  const { nama, NIK, umur, alamat, no_hp } = data;

  const query = `
    UPDATE pasien 
    SET nama = ?, nik = ?, umur = ?, alamat = ?, no_hp = ? 
    WHERE id_pasien = ?
  `;

  await db.query(query, [nama, NIK, umur, alamat, no_hp, id]);
  await auditService.recordDataLog(userId, 'UPDATE', 'pasien', id);

  return { id_pasien: id, nama, NIK, umur, alamat, no_hp };
};

/**
 * Hapus pasien
 * @param {string} id - ID Pasien
 * @param {string} userId - ID pengguna yang melakukan aksi
 * @returns {Object} Hasil penghapusan
 */
const deletePasien = async (id, userId) => {
  const [result] = await db.query('DELETE FROM pasien WHERE id_pasien = ?', [id]);

  if (result.affectedRows > 0) {
    await auditService.recordDataLog(userId, 'DELETE', 'pasien', id);
  }

  return result;
};

/**
 * Ambil riwayat pemeriksaan pasien
 * @param {string} id - ID Pasien
 * @returns {Array} Riwayat pemeriksaan
 */
const getRiwayatPasien = async (id) => {
  const query = `
    SELECT * FROM pemeriksaan 
    WHERE id_pasien = ? 
    ORDER BY tanggal_pemeriksaan DESC
  `;
  const [rows] = await db.query(query, [id]);
  return rows;
};

module.exports = {
  getAllPasien,
  getPasienById,
  createPasien,
  updatePasien,
  deletePasien,
  getRiwayatPasien
};
