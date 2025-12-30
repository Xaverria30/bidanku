/**
 * Service Audit
 * Menangani pencatatan aktivitas pengguna dan upaya akses
 */

const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Catat upaya login
 * @param {string|null} userId - ID User (null jika user tidak ditemukan)
 * @param {string} username - Username yang dicoba
 * @param {'BERHASIL'|'GAGAL'} status - Status login
 * @param {string} ipAddress - Alamat IP Klien
 */
const recordLoginAttempt = async (userId, username, status, ipAddress) => {
  try {
    const id_akses = uuidv4();
    const query = `
      INSERT INTO audit_log_akses (id_akses, id_user, username, status, ip_address, tanggal_akses)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    await db.query(query, [id_akses, userId, username, status, ipAddress]);
  } catch (error) {
    console.error('[AUDIT] Gagal mencatat upaya login:', error.message);
  }
};

/**
 * Ambil log akses (riwayat login)
 * @param {Object} filters - Opsi filter
 * @returns {Array} Daftar log akses
 */
const getAccessLogs = async (filters = {}) => {
  try {
    let query = 'SELECT * FROM audit_log_akses WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.username) {
      query += ' AND username LIKE ?';
      params.push(`%${filters.username}%`);
    }
    if (filters.startDate) {
      query += ' AND tanggal_akses >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ' AND tanggal_akses <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY tanggal_akses DESC LIMIT 1000';

    const [results] = await db.query(query, params);
    return results;
  } catch (error) {
    console.error('[AUDIT] Gagal mengambil log akses:', error.message);
    throw error;
  }
};

/**
 * Catat log modifikasi data (Operasi CRUD)
 * @param {string} userId - ID User yang melakukan aksi
 * @param {'CREATE'|'UPDATE'|'DELETE'} action - Jenis aksi
 * @param {string} tableName - Nama tabel yang terpengaruh
 * @param {string} dataId - ID data yang terpengaruh
 */
const recordDataLog = async (userId, action, tableName, dataId) => {
  try {
    const id_audit = uuidv4();
    const query = `
      INSERT INTO audit_logs (id_audit, id_user, action, description, id_data_terkait, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    await db.query(query, [id_audit, userId, action, tableName, dataId]);
  } catch (error) {
    console.error('[AUDIT] Gagal mencatat log data:', error.message);
    throw error;
  }
};

/**
 * Ambil log modifikasi data dasar
 * @param {Object} filters - Opsi filter
 * @returns {Array} Daftar log audit dasar
 */
const getDataLogs = async (filters = {}) => {
  try {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (filters.action) {
      query += ' AND action = ?';
      params.push(filters.action);
    }
    if (filters.description) {
      query += ' AND description LIKE ?';
      params.push(`%${filters.description}%`);
    }
    if (filters.username) {
      query += ' AND id_user = (SELECT id_user FROM users WHERE username LIKE ?)';
      params.push(`%${filters.username}%`);
    }
    if (filters.startDate) {
      query += ' AND created_at >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ' AND created_at <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY created_at DESC LIMIT 1000';

    const [results] = await db.query(query, params);
    return results;
  } catch (error) {
    console.error('[AUDIT] Gagal mengambil log data:', error.message);
    throw error;
  }
};

/**
 * Ambil log modifikasi data dengan informasi detail
 * @param {Object} filters - Opsi filter
 * @returns {Array} Daftar log audit dengan info user dan detail data
 */
const getDetailedDataLogs = async (filters = {}) => {
  try {
    let query = `
      SELECT 
        a.id_audit, 
        a.id_user, 
        a.action, 
        a.description AS kategori, 
        a.id_data_terkait,
        a.created_at AS tanggal,
        u.username AS diubah_oleh,
        p.nama AS nama_pasien,
        CASE 
          WHEN a.description = 'layanan_anc' THEN anc.no_reg_baru
          WHEN a.description = 'layanan_kb' THEN kb.nomor_registrasi_baru
          WHEN a.description = 'layanan_persalinan' THEN pers.no_reg_baru
          WHEN a.description = 'layanan_imunisasi' THEN imun.no_reg
          WHEN a.description = 'layanan_kunjungan_pasien' THEN kjung.no_reg
          WHEN a.description = 'jadwal' THEN NULL
          ELSE NULL
        END AS nomor_registrasi
      FROM audit_logs a
      LEFT JOIN users u ON a.id_user = u.id_user
      LEFT JOIN pemeriksaan pem ON a.id_data_terkait = pem.id_pemeriksaan
      LEFT JOIN pasien p ON pem.id_pasien = p.id_pasien
      LEFT JOIN layanan_anc anc ON a.id_data_terkait = anc.id_anc
      LEFT JOIN layanan_kb kb ON a.id_data_terkait = kb.id_kb
      LEFT JOIN layanan_persalinan pers ON a.id_data_terkait = pers.id_persalinan
      LEFT JOIN layanan_imunisasi imun ON a.id_data_terkait = imun.id_imunisasi
      LEFT JOIN layanan_kunjungan_pasien kjung ON a.id_data_terkait = kjung.id_kunjungan
      LEFT JOIN jadwal jad ON a.id_data_terkait = jad.id_jadwal
      LEFT JOIN pasien p2 ON jad.id_pasien = p2.id_pasien
      WHERE 1=1
    `;
    const params = [];

    if (filters.action) {
      query += ' AND a.action = ?';
      params.push(filters.action);
    }
    if (filters.kategori) {
      query += ' AND a.description LIKE ?';
      params.push(`%${filters.kategori}%`);
    }
    if (filters.username) {
      query += ' AND u.username LIKE ?';
      params.push(`%${filters.username}%`);
    }
    if (filters.startDate) {
      query += ' AND a.created_at >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ' AND a.created_at <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY a.created_at DESC LIMIT 1000';

    const [results] = await db.query(query, params);
    return results;
  } catch (error) {
    console.error('[AUDIT] Gagal mengambil log data detail:', error.message);
    throw error;
  }
};

module.exports = {
  recordLoginAttempt,
  recordDataLog,
  getAccessLogs,
  getDataLogs,
  getDetailedDataLogs
};
