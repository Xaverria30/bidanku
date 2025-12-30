/**
 * Service ANC (Antenatal Care/Pemeriksaan Kehamilan)
 * Menangani semua operasi database terkait ANC dengan dukungan transaksi
 */

const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const auditService = require('./audit.service');
const jadwalService = require('./jadwal.service');

/**
 * Membuat registrasi ANC baru dengan data terkait
 * Menggunakan transaksi database (ACID) untuk menjaga konsistensi data
 * 
 * Frontend mengirim data: 
 * - Detail Ibu: nama_istri, nik_istri, umur_istri, alamat, no_hp
 * - Detail Layanan: jenis_layanan, tanggal, tindakan, no_reg_lama, no_reg_baru
 * - Detail Suami: nama_suami, nik_suami, umur_suami
 * - Hasil Pemeriksaan: hpht, hpl, hasil_pemeriksaan, keterangan
 * 
 * @param {Object} data - Data registrasi ANC dari frontend
 * @param {string} userId - ID pengguna yang melakukan aksi
 * @returns {Object} Data registrasi yang dibuat
 */
const createRegistrasiANC = async (data, userId) => {
  const {
    nama_istri, nik_istri, umur_istri, alamat, no_hp,
    jenis_layanan, tanggal, tindakan, no_reg_lama, no_reg_baru,
    nama_suami, nik_suami, umur_suami,
    hpht, hpl, hasil_pemeriksaan, keterangan
  } = data;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Cari atau buat data pasien (ibu)
    // Jika pasien sudah ada berdasarkan NIK, update datanya
    let id_pasien;
    let existingPasien = [];

    // Hanya cek NIK jika ada dan valid
    if (nik_istri && nik_istri.trim().length > 0) {
      [existingPasien] = await connection.query(
        'SELECT id_pasien FROM pasien WHERE nik = ?',
        [nik_istri]
      );
    }

    if (existingPasien.length > 0) {
      id_pasien = existingPasien[0].id_pasien;
      await connection.query(
        'UPDATE pasien SET nama = ?, umur = ?, alamat = ?, no_hp = ? WHERE id_pasien = ?',
        [nama_istri, umur_istri, alamat, no_hp, id_pasien]
      );
    } else {
      id_pasien = uuidv4();
      await connection.query(
        'INSERT INTO pasien (id_pasien, nama, nik, umur, alamat, no_hp) VALUES (?, ?, ?, ?, ?, ?)',
        [id_pasien, nama_istri, nik_istri || null, umur_istri, alamat, no_hp]
      );
    }

    // 2. Buat record pemeriksaan dengan format SOAP
    const id_pemeriksaan = uuidv4();

    // Susun field SOAP (Subjektif, Objektif, Analisa, Tatalaksana) dari data frontend
    const subjektif_final = `ANC Kunjungan${hpht ? `. HPHT: ${hpht}` : ''}${hpl ? `, HPL: ${hpl}` : ''}`;
    const objektif_final = hasil_pemeriksaan ? `Hasil Pemeriksaan: ${hasil_pemeriksaan}` : '';
    const analisa_final = keterangan || '';
    const tatalaksana_final = tindakan ? `Tindakan: ${tindakan}` : '';

    await connection.query(
      `INSERT INTO pemeriksaan (id_pemeriksaan, id_pasien, jenis_layanan, subjektif, objektif, analisa, tatalaksana, tanggal_pemeriksaan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_pemeriksaan, id_pasien, jenis_layanan, subjektif_final, objektif_final, analisa_final, tatalaksana_final, tanggal]
    );

    // 3. Buat record spesifik layanan ANC
    const id_anc = uuidv4();
    await connection.query(
      `INSERT INTO layanan_anc (id_anc, id_pemeriksaan, no_reg_lama, no_reg_baru, nama_suami, nik_suami, umur_suami, hpht, hpl, hasil_pemeriksaan, tindakan, keterangan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_anc, id_pemeriksaan, no_reg_lama || null, no_reg_baru || null, nama_suami || null, nik_suami || null, umur_suami || null, hpht || null, hpl || null, hasil_pemeriksaan, tindakan || null, keterangan || null]
    );

    await connection.commit();

    // Catat log aktivitas
    await auditService.recordDataLog(userId, 'CREATE', 'layanan_anc', id_anc);

    return {
      id_anc,
      id_pemeriksaan,
      id_pasien,
      message: 'Registrasi ANC berhasil disimpan'
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Ambil data ANC berdasarkan ID Pemeriksaan
 * @param {string} id_pemeriksaan - Link ke tabel pemeriksaan
 * @returns {Object} Record ANC lengkap dengan data pasien
 */
const getANCById = async (id_pemeriksaan) => {
  const query = `
    SELECT 
      p.id_pemeriksaan, p.id_pasien, p.jenis_layanan, p.subjektif, p.objektif, p.analisa, p.tatalaksana,
      DATE_FORMAT(p.tanggal_pemeriksaan, '%Y-%m-%d') as tanggal_pemeriksaan,
      pas.nama, pas.nik, pas.umur, pas.alamat, pas.no_hp,
      anc.id_anc, anc.no_reg_lama, anc.no_reg_baru, anc.nama_suami, anc.nik_suami, anc.umur_suami,
      DATE_FORMAT(anc.hpht, '%Y-%m-%d') as hpht,
      DATE_FORMAT(anc.hpl, '%Y-%m-%d') as hpl,
      anc.hasil_pemeriksaan, anc.tindakan, anc.keterangan,
      j.jam_mulai, j.jam_selesai
    FROM pemeriksaan p
    LEFT JOIN pasien pas ON p.id_pasien = pas.id_pasien
    LEFT JOIN layanan_anc anc ON p.id_pemeriksaan = anc.id_pemeriksaan
    LEFT JOIN jadwal j ON p.id_pasien = j.id_pasien AND j.jenis_layanan = 'ANC' AND j.tanggal = p.tanggal_pemeriksaan
    WHERE p.id_pemeriksaan = ? AND p.jenis_layanan = 'ANC'
  `;
  const [rows] = await db.query(query, [id_pemeriksaan]);
  return rows[0] || null;
};

/**
 * Update registrasi ANC
 * @param {string} id_pemeriksaan - ID Pemeriksaan
 * @param {Object} data - Data update dari frontend
 * @param {string} userId - ID Pengguna
 * @returns {Object} Data ANC yang sudah diupdate
 */
const updateANCRegistrasi = async (id_pemeriksaan, data, userId) => {
  const {
    nama_istri, nik_istri, umur_istri, alamat, no_hp,
    tanggal, tindakan, no_reg_lama, no_reg_baru,
    nama_suami, nik_suami, umur_suami,
    hpht, hpl, hasil_pemeriksaan, keterangan
  } = data;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Cek apakah data pemeriksaan ada
    const [existingPemeriksaan] = await connection.query(
      'SELECT id_pasien FROM pemeriksaan WHERE id_pemeriksaan = ?',
      [id_pemeriksaan]
    );

    if (!existingPemeriksaan[0]) {
      throw new Error('Data pemeriksaan tidak ditemukan');
    }

    const id_pasien = existingPemeriksaan[0].id_pasien;

    // Update data pasien
    await connection.query(
      'UPDATE pasien SET nama = ?, nik = ?, umur = ?, alamat = ?, no_hp = ? WHERE id_pasien = ?',
      [nama_istri, nik_istri, umur_istri, alamat, no_hp || null, id_pasien]
    );

    // Update pemeriksaan dengan format SOAP
    const subjektif_final = `ANC Kunjungan${hpht ? `. HPHT: ${hpht}` : ''}${hpl ? `, HPL: ${hpl}` : ''}`;
    const objektif_final = hasil_pemeriksaan ? `Hasil Pemeriksaan: ${hasil_pemeriksaan}` : '';
    const analisa_final = keterangan || '';
    const tatalaksana_final = tindakan ? `Tindakan: ${tindakan}` : '';

    await connection.query(
      `UPDATE pemeriksaan SET subjektif = ?, objektif = ?, analisa = ?, tatalaksana = ?, tanggal_pemeriksaan = ?
       WHERE id_pemeriksaan = ?`,
      [subjektif_final, objektif_final, analisa_final, tatalaksana_final, tanggal, id_pemeriksaan]
    );

    // Update layanan_anc
    await connection.query(
      `UPDATE layanan_anc SET no_reg_lama = ?, no_reg_baru = ?, nama_suami = ?, nik_suami = ?, umur_suami = ?,
       hpht = ?, hpl = ?, hasil_pemeriksaan = ?, tindakan = ?, keterangan = ?
       WHERE id_pemeriksaan = ?`,
      [no_reg_lama || null, no_reg_baru || null, nama_suami || null, nik_suami || null, umur_suami || null, hpht || null, hpl || null, hasil_pemeriksaan, tindakan || null, keterangan || null, id_pemeriksaan]
    );

    await connection.commit();
    await auditService.recordDataLog(userId, 'UPDATE', 'layanan_anc', id_pemeriksaan);

    return getANCById(id_pemeriksaan);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Hapus registrasi ANC
 * @param {string} id_pemeriksaan - ID Pemeriksaan
 * @param {string} userId - ID Pengguna
 */
const deleteANCRegistrasi = async (id_pemeriksaan, userId) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Hapus dari tabel layanan_anc
    await connection.query('DELETE FROM layanan_anc WHERE id_pemeriksaan = ?', [id_pemeriksaan]);

    // Hapus dari tabel pemeriksaan
    await connection.query('DELETE FROM pemeriksaan WHERE id_pemeriksaan = ?', [id_pemeriksaan]);

    await connection.commit();
    await auditService.recordDataLog(userId, 'DELETE', 'layanan_anc', id_pemeriksaan);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createRegistrasiANC,
  getANCById,
  updateANCRegistrasi,
  deleteANCRegistrasi
};
