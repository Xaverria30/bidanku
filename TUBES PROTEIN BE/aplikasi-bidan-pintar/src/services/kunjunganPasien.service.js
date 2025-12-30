/**
 * Service Kunjungan Pasien
 * Menangani semua operasi database kunjungan pasien umum
 */

const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const auditService = require('./audit.service');

/**
 * Ambil daftar kunjungan pasien dengan pencarian opsional
 * @param {string} search - Kuery pencarian nama pasien
 * @returns {Array} Daftar kunjungan pasien
 */
const getAllKunjunganPasien = async (search = '') => {
  const connection = await db.getConnection();

  try {
    let query = `
      SELECT 
        k.id_kunjungan as id,
        k.tanggal,
        k.nama_pasien,
        'Kunjungan Pasien' as jenis_layanan,
        p.tanggal_pemeriksaan
      FROM layanan_kunjungan_pasien k
      LEFT JOIN pemeriksaan p ON k.id_pemeriksaan = p.id_pemeriksaan
    `;

    let params = [];

    if (search) {
      query += ' WHERE k.nama_pasien LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY k.tanggal DESC';

    const [rows] = await connection.query(query, params);
    return rows;
  } finally {
    connection.release();
  }
};

/**
 * Ambil detail kunjungan pasien berdasarkan ID
 * @param {string} id - ID Kunjungan
 * @returns {Object} Data kunjungan
 */
const getKunjunganPasienById = async (id) => {
  const connection = await db.getConnection();

  try {
    const [rows] = await connection.query(
      `SELECT 
        k.*,
        'Kunjungan Pasien' as jenis_layanan
      FROM layanan_kunjungan_pasien k
      WHERE k.id_kunjungan = ?`,
      [id]
    );

    if (rows.length === 0) {
      throw new Error('Data kunjungan tidak ditemukan');
    }

    return rows[0];
  } finally {
    connection.release();
  }
};

/**
 * Buat registrasi kunjungan pasien umum report
 * @param {Object} data - Data registrasi
 * @param {string} userId - ID Pengguna
 * @returns {Object} Data registrasi yang dibuat
 */
const createRegistrasiKunjunganPasien = async (data, userId) => {
  const {
    nama_pasien, nik_pasien, umur_pasien, bb_pasien, td_pasien,
    nama_wali, nik_wali, umur_wali,
    jenis_layanan, tanggal, no_reg, jenis_kunjungan,
    keluhan, diagnosa, terapi_obat, keterangan,
    subjektif, objektif, analisa, tatalaksana
  } = data;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Cari atau buat pasien (menggunakan wali sebagai master pasien untuk keperluan administratif)
    let id_pasien;
    let existingPasien = [];
    const nikToCheck = nik_wali || nik_pasien;

    // Hanya cek NIK jika ada dan valid
    if (nikToCheck && nikToCheck.trim().length > 0) {
      [existingPasien] = await connection.query(
        'SELECT id_pasien FROM pasien WHERE nik = ?',
        [nikToCheck]
      );
    }

    if (existingPasien.length > 0) {
      id_pasien = existingPasien[0].id_pasien;
      await connection.query(
        'UPDATE pasien SET nama = ?, umur = ? WHERE id_pasien = ?',
        [nama_wali || nama_pasien, umur_wali || umur_pasien, id_pasien]
      );
    } else {
      id_pasien = uuidv4();
      // Gunakan NIK jika ada, jika tidak generate random (untuk keperluan internal)
      const finalNik = (nikToCheck && nikToCheck.trim().length > 0) ? nikToCheck : null;

      await connection.query(
        'INSERT INTO pasien (id_pasien, nama, nik, umur) VALUES (?, ?, ?, ?)',
        [id_pasien, nama_wali || nama_pasien, finalNik, umur_wali || umur_pasien]
      );
    }

    // 2. Buat record pemeriksaan dengan data SOAP
    const id_pemeriksaan = uuidv4();
    const subjektif_final = subjektif || `Keluhan: ${keluhan || '-'}`;
    const objektif_final = objektif || `BB: ${bb_pasien || '-'} kg, TD: ${td_pasien || '-'}`;
    const analisa_final = analisa || diagnosa || '-';
    const tatalaksana_final = tatalaksana || `Terapi: ${terapi_obat || '-'}. ${keterangan || ''}`;

    await connection.query(
      `INSERT INTO pemeriksaan (id_pemeriksaan, id_pasien, jenis_layanan, subjektif, objektif, analisa, tatalaksana, tanggal_pemeriksaan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_pemeriksaan, id_pasien, 'Kunjungan Pasien', subjektif_final, objektif_final, analisa_final, tatalaksana_final, tanggal]
    );

    // 3. Buat record spesifik kunjungan
    const id_kunjungan = uuidv4();
    await connection.query(
      `INSERT INTO layanan_kunjungan_pasien (id_kunjungan, id_pemeriksaan, tanggal, no_reg, jenis_kunjungan, nama_pasien, nik_pasien, umur_pasien, bb_pasien, td_pasien, nama_wali, nik_wali, umur_wali, keluhan, diagnosa, terapi_obat, keterangan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_kunjungan, id_pemeriksaan, tanggal, no_reg, jenis_kunjungan, nama_pasien, nik_pasien, umur_pasien, bb_pasien, td_pasien, nama_wali, nik_wali, umur_wali, keluhan, diagnosa, terapi_obat, keterangan]
    );

    await connection.commit();

    if (userId) {
      await auditService.recordDataLog(userId, 'CREATE', 'layanan_kunjungan_pasien', id_kunjungan);
    }

    return { id_kunjungan, id_pemeriksaan, id_pasien };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Update kunjungan pasien
 * @param {string} id - ID Kunjungan
 * @param {Object} data - Data update
 * @param {string} userId - ID Pengguna
 * @returns {Object} Pesan sukses
 */
const updateKunjunganPasien = async (id, data, userId) => {
  const {
    nama_pasien, nik_pasien, umur_pasien, bb_pasien, td_pasien,
    nama_wali, nik_wali, umur_wali,
    tanggal, no_reg, jenis_kunjungan,
    keluhan, diagnosa, terapi_obat, keterangan
  } = data;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Dapatkan id_pemeriksaan
    const [kunjungan] = await connection.query(
      'SELECT id_pemeriksaan FROM layanan_kunjungan_pasien WHERE id_kunjungan = ?',
      [id]
    );

    if (kunjungan.length === 0) {
      throw new Error('Data kunjungan tidak ditemukan');
    }

    const id_pemeriksaan = kunjungan[0].id_pemeriksaan;

    // Update record pemeriksaan
    const subjektif_final = `Keluhan: ${keluhan || '-'}`;
    const objektif_final = `BB: ${bb_pasien || '-'} kg, TD: ${td_pasien || '-'}`;
    const analisa_final = diagnosa || '-';
    const tatalaksana_final = `Terapi: ${terapi_obat || '-'}. ${keterangan || ''}`;

    await connection.query(
      `UPDATE pemeriksaan 
       SET subjektif = ?, objektif = ?, analisa = ?, tatalaksana = ?, tanggal_pemeriksaan = ?
       WHERE id_pemeriksaan = ?`,
      [subjektif_final, objektif_final, analisa_final, tatalaksana_final, tanggal, id_pemeriksaan]
    );

    // Update record kunjungan
    await connection.query(
      `UPDATE layanan_kunjungan_pasien 
       SET tanggal = ?, no_reg = ?, jenis_kunjungan = ?, nama_pasien = ?, nik_pasien = ?, umur_pasien = ?, 
           bb_pasien = ?, td_pasien = ?, nama_wali = ?, nik_wali = ?, umur_wali = ?, 
           keluhan = ?, diagnosa = ?, terapi_obat = ?, keterangan = ?
       WHERE id_kunjungan = ?`,
      [tanggal, no_reg, jenis_kunjungan, nama_pasien, nik_pasien, umur_pasien, bb_pasien, td_pasien, nama_wali, nik_wali, umur_wali, keluhan, diagnosa, terapi_obat, keterangan, id]
    );

    await connection.commit();

    if (userId) {
      await auditService.recordDataLog(userId, 'UPDATE', 'layanan_kunjungan_pasien', id);
    }

    return { message: 'Data kunjungan berhasil diupdate' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Hapus kunjungan pasien
 * @param {string} id - ID Kunjungan
 * @param {string} userId - ID Pengguna
 * @returns {Object} Pesan sukses
 */
const deleteKunjunganPasien = async (id, userId) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Dapatkan id_pemeriksaan sebelum menghapus
    const [kunjungan] = await connection.query(
      'SELECT id_pemeriksaan FROM layanan_kunjungan_pasien WHERE id_kunjungan = ?',
      [id]
    );

    if (kunjungan.length === 0) {
      throw new Error('Data kunjungan tidak ditemukan');
    }

    const id_pemeriksaan = kunjungan[0].id_pemeriksaan;

    // Hapus record kunjungan (penghapusan pemeriksaan dilakukan manual karena tidak ada cascade)
    await connection.query('DELETE FROM layanan_kunjungan_pasien WHERE id_kunjungan = ?', [id]);
    await connection.query('DELETE FROM pemeriksaan WHERE id_pemeriksaan = ?', [id_pemeriksaan]);

    await connection.commit();

    if (userId) {
      await auditService.recordDataLog(userId, 'DELETE', 'layanan_kunjungan_pasien', id);
    }

    return { message: 'Data kunjungan berhasil dihapus' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllKunjunganPasien,
  getKunjunganPasienById,
  createRegistrasiKunjunganPasien,
  updateKunjunganPasien,
  deleteKunjunganPasien
};
