/**
 * Service Laporan
 * Menangani semua operasi database terkait laporan
 */

const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Ambil data laporan bulanan untuk ekspor Excel
 * @param {number} bulan - Bulan (1-12)
 * @param {number} tahun - Tahun
 * @param {string} jenis_layanan - Filter jenis layanan (opsional)
 * @returns {Array} Data laporan
 */
const getLaporanData = async (bulan, tahun, jenis_layanan) => {
  let query = `
        SELECT 
          COALESCE(p.nama, 'Pasien Tidak Ditemukan') AS nama_pasien,
          r.tanggal_pemeriksaan AS tanggal,
          r.jenis_layanan,
          
          CASE 
            WHEN r.jenis_layanan = 'ANC' THEN CONCAT('HPHT: ', COALESCE(DATE_FORMAT(anc.hpht, '%d-%m-%Y'), '-'), ', HPL: ', COALESCE(DATE_FORMAT(anc.hpl, '%d-%m-%Y'), '-'))
            WHEN r.jenis_layanan = 'KB' THEN r.subjektif
            WHEN r.jenis_layanan = 'Imunisasi' THEN CONCAT('Imunisasi: ', COALESCE(im.jenis_imunisasi, '-'))
            WHEN r.jenis_layanan = 'Persalinan' THEN CONCAT('Anak ke-', COALESCE(pers.anak_ke, '-'), ', ', COALESCE(pers.jenis_partus, '-'))
            WHEN r.jenis_layanan = 'Kunjungan Pasien' THEN kp.keluhan
            ELSE r.subjektif
          END as subjektif,
          
          CASE 
            WHEN r.jenis_layanan = 'ANC' THEN anc.hasil_pemeriksaan
            WHEN r.jenis_layanan = 'KB' THEN CONCAT('TD: ', COALESCE(kb.td_ibu, '-'), ', BB: ', COALESCE(kb.bb_ibu, '-'))
            WHEN r.jenis_layanan = 'Imunisasi' THEN CONCAT('TB: ', COALESCE(im.tb_bayi, '-'), ' cm, BB: ', COALESCE(im.bb_bayi, '-'), ' kg')
            WHEN r.jenis_layanan = 'Persalinan' THEN CONCAT('Ibu TD: ', COALESCE(pers.td_ibu, '-'), ', BB: ', COALESCE(pers.bb_ibu, '-'), ' | Bayi BB: ', COALESCE(pers.bb_bayi, '-'))
            WHEN r.jenis_layanan = 'Kunjungan Pasien' THEN CONCAT('TD: ', COALESCE(kp.td_pasien, '-'), ', BB: ', COALESCE(kp.bb_pasien, '-'))
            ELSE r.objektif
          END as objektif,
          
          CASE 
            WHEN r.jenis_layanan = 'ANC' THEN anc.keterangan
            WHEN r.jenis_layanan = 'KB' THEN kb.catatan
            WHEN r.jenis_layanan = 'Imunisasi' THEN im.jenis_imunisasi
            WHEN r.jenis_layanan = 'Persalinan' THEN pers.jenis_partus
            WHEN r.jenis_layanan = 'Kunjungan Pasien' THEN kp.diagnosa
            ELSE r.analisa
          END as analisa,
          
          CASE 
            WHEN r.jenis_layanan = 'ANC' THEN anc.tindakan
            WHEN r.jenis_layanan = 'KB' THEN CONCAT('Metode: ', COALESCE(kb.metode, '-'))
            WHEN r.jenis_layanan = 'Imunisasi' THEN CONCAT('Jadwal Berikutnya: ', COALESCE(DATE_FORMAT(im.jadwal_selanjutnya, '%d-%m-%Y'), '-'))
            WHEN r.jenis_layanan = 'Persalinan' THEN CONCAT('Penolong: ', COALESCE(pers.penolong, '-'), ', IMD: ', IF(pers.imd_dilakukan = 1, 'Ya', 'Tidak'))
            WHEN r.jenis_layanan = 'Kunjungan Pasien' THEN CONCAT(COALESCE(kp.terapi_obat, '-'), ', ', COALESCE(kp.keterangan, ''))
            ELSE r.tatalaksana
          END as tatalaksana

        FROM pemeriksaan r
        LEFT JOIN pasien p ON r.id_pasien = p.id_pasien
        
        LEFT JOIN layanan_anc anc ON r.id_pemeriksaan = anc.id_pemeriksaan
        LEFT JOIN layanan_kb kb ON r.id_pemeriksaan = kb.id_pemeriksaan
        LEFT JOIN layanan_imunisasi im ON r.id_pemeriksaan = im.id_pemeriksaan
        LEFT JOIN layanan_persalinan pers ON r.id_pemeriksaan = pers.id_pemeriksaan
        LEFT JOIN layanan_kunjungan_pasien kp ON r.id_pemeriksaan = kp.id_pemeriksaan
        
        WHERE MONTH(r.tanggal_pemeriksaan) = ? AND YEAR(r.tanggal_pemeriksaan) = ? AND r.deleted_at IS NULL AND p.deleted_at IS NULL
      `;

  const params = [bulan, tahun];

  if (jenis_layanan && jenis_layanan !== 'Semua') {
    query += ` AND r.jenis_layanan = ?`;
    params.push(jenis_layanan);
  }

  query += ` ORDER BY r.tanggal_pemeriksaan ASC`;

  const [rows] = await db.query(query, params);
  return rows;
};

/**
 * Ambil Laporan ANC detail sesuai Register
 */
const getLaporanANC = async (bulan, tahun) => {
  const query = `
        SELECT
          pem.tanggal_pemeriksaan,
          p.nama as nama_istri,
          anc.nama_suami,
          p.nik as nik_istri,
          p.umur as umur_istri,
          p.alamat,
          anc.no_reg_lama,
          anc.no_reg_baru,
          anc.hpht,
          anc.hpl,
          anc.hasil_pemeriksaan,
          anc.tindakan,
          anc.keterangan
        FROM layanan_anc anc
        JOIN pemeriksaan pem ON anc.id_pemeriksaan = pem.id_pemeriksaan
        JOIN pasien p ON pem.id_pasien = p.id_pasien
        WHERE MONTH(pem.tanggal_pemeriksaan) = ? AND YEAR(pem.tanggal_pemeriksaan) = ? AND pem.deleted_at IS NULL AND p.deleted_at IS NULL
        ORDER BY pem.tanggal_pemeriksaan ASC
      `;
  const [rows] = await db.query(query, [bulan, tahun]);
  return rows;
};

/**
 * Ambil Laporan KB detail sesuai Register
 */
const getLaporanKB = async (bulan, tahun) => {
  const query = `
        SELECT
          pem.tanggal_pemeriksaan,
          p.nama as nama_istri,
          kb.nama_ayah as nama_suami,
          p.nik as nik_istri,
          p.umur as umur_istri,
          kb.umur_ayah as umur_suami,
          p.alamat,
          kb.nomor_registrasi_lama,
          kb.nomor_registrasi_baru,
          kb.td_ibu,
          kb.bb_ibu,
          kb.td_ayah,
          kb.bb_ayah,
          kb.metode,
          kb.kunjungan_ulang,
          kb.catatan,
          p.no_hp as no_hp_istri
        FROM layanan_kb kb
        JOIN pemeriksaan pem ON kb.id_pemeriksaan = pem.id_pemeriksaan
        JOIN pasien p ON pem.id_pasien = p.id_pasien
        WHERE MONTH(pem.tanggal_pemeriksaan) = ? AND YEAR(pem.tanggal_pemeriksaan) = ? AND pem.deleted_at IS NULL AND p.deleted_at IS NULL
        ORDER BY pem.tanggal_pemeriksaan ASC
      `;
  const [rows] = await db.query(query, [bulan, tahun]);
  return rows;
};

/**
 * Ambil Laporan Imunisasi detail sesuai Register
 */
const getLaporanImunisasi = async (bulan, tahun) => {
  const query = `
        SELECT
          pem.tanggal_pemeriksaan,
          im.no_reg,
          im.nama_bayi_balita,
          im.nama_ibu,
          im.nama_ayah,
          p.nik,
          p.alamat,
          im.tanggal_lahir_bayi,
          im.tb_bayi,
          im.bb_bayi,
          im.jenis_imunisasi,
          im.jadwal_selanjutnya,
          im.pengobatan
        FROM layanan_imunisasi im
        JOIN pemeriksaan pem ON im.id_pemeriksaan = pem.id_pemeriksaan
        JOIN pasien p ON pem.id_pasien = p.id_pasien
        WHERE MONTH(pem.tanggal_pemeriksaan) = ? AND YEAR(pem.tanggal_pemeriksaan) = ? AND pem.deleted_at IS NULL AND p.deleted_at IS NULL
        ORDER BY pem.tanggal_pemeriksaan ASC
      `;
  const [rows] = await db.query(query, [bulan, tahun]);
  return rows;
};

/**
 * Ambil Laporan Persalinan detail sesuai Register
 */
const getLaporanPersalinan = async (bulan, tahun) => {
  const query = `
      SELECT
        pem.tanggal_pemeriksaan,
        p.nama as nama_istri,
        prs.nama_suami,
        p.nik as nik_istri,
        p.umur as umur_istri,
        p.alamat,
        prs.no_reg_lama,
        prs.no_reg_baru,
        prs.tanggal_lahir,
        prs.jenis_kelamin,
        prs.bb_bayi,
        prs.pb_bayi,
        prs.lika_bayi,
        prs.penolong,
        prs.jenis_partus,
        prs.imd_dilakukan
      FROM layanan_persalinan prs
      JOIN pemeriksaan pem ON prs.id_pemeriksaan = pem.id_pemeriksaan
      JOIN pasien p ON pem.id_pasien = p.id_pasien
      WHERE MONTH(pem.tanggal_pemeriksaan) = ? AND YEAR(pem.tanggal_pemeriksaan) = ? AND p.deleted_at IS NULL AND pem.deleted_at IS NULL
      ORDER BY pem.tanggal_pemeriksaan ASC
    `;
  const [rows] = await db.query(query, [bulan, tahun]);
  return rows;
};

/**
 * Ambil Laporan Kunjungan Pasien (Umum) detail sesuai Register
 */
const getLaporanKunjunganPasien = async (bulan, tahun) => {
  const query = `
        SELECT
          pem.tanggal_pemeriksaan,
          kp.no_reg,
          kp.nama_pasien, 
          kp.nama_wali,
          COALESCE(p.nik, kp.nik_pasien) as nik_pasien,
          kp.umur_pasien,
          p.alamat,
          kp.jenis_kunjungan,
          kp.td_pasien,
          kp.bb_pasien,
          kp.keluhan,
          kp.diagnosa,
          kp.terapi_obat,
          kp.keterangan
        FROM layanan_kunjungan_pasien kp
        JOIN pemeriksaan pem ON kp.id_pemeriksaan = pem.id_pemeriksaan
        LEFT JOIN pasien p ON pem.id_pasien = p.id_pasien
        WHERE MONTH(pem.tanggal_pemeriksaan) = ? AND YEAR(pem.tanggal_pemeriksaan) = ? AND pem.deleted_at IS NULL AND (p.deleted_at IS NULL OR p.id_pasien IS NULL)
        ORDER BY pem.tanggal_pemeriksaan ASC
      `;
  const [rows] = await db.query(query, [bulan, tahun]);
  return rows;
};

// ... skipped ...

/**
 * Hitung statistik ringkasan untuk periode tertentu
 * @param {string} jenis_layanan - Jenis layanan atau 'Semua'
 * @param {number} bulan - Bulan (1-12)
 * @param {number} tahun - Tahun
 * @returns {Object} Statistik
 */
const calculateLaporanSummary = async (jenis_layanan, bulan, tahun) => {
  let query = `
        SELECT 
          COUNT(DISTINCT pe.id_pasien) as jumlah_pasien,
          COUNT(pe.id_pemeriksaan) as jumlah_kunjungan
        FROM pemeriksaan pe
        LEFT JOIN pasien p ON pe.id_pasien = p.id_pasien
        WHERE MONTH(pe.tanggal_pemeriksaan) = ? 
          AND YEAR(pe.tanggal_pemeriksaan) = ?
          AND pe.deleted_at IS NULL
          AND p.deleted_at IS NULL
      `;

  const params = [bulan, tahun];

  if (jenis_layanan && jenis_layanan !== 'Semua') {
    query += ` AND pe.jenis_layanan = ?`;
    params.push(jenis_layanan);
  }

  const [rows] = await db.query(query, params);

  return {
    jumlah_pasien: rows[0]?.jumlah_pasien || 0,
    jumlah_kunjungan: rows[0]?.jumlah_kunjungan || 0
  };
};

module.exports = {
  getLaporanData,
  getLaporanList,
  getLaporanById,
  createLaporan,
  updateLaporan,
  deleteLaporan,
  calculateLaporanSummary,
  getLaporanANC,
  getLaporanKB,
  getLaporanImunisasi,
  getLaporanPersalinan,
  getLaporanKunjunganPasien
};
