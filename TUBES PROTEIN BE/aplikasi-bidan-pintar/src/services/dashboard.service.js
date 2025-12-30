/**
 * Service Dashboard
 * Menangani statistik dan analitik dashboard
 */

const db = require('../config/database');
const { VALID_LAYANAN } = require('../utils/constant');

/**
 * Ambil ringkasan layanan berdasarkan kategori
 * @param {number} tahun - Filter tahun (opsional)
 * @returns {Object} Ringkasan dengan total dan rincian per layanan
 */
const getRekapLayanan = async (tahun) => {
  const params = [VALID_LAYANAN];

  let query = `
    SELECT 
      jenis_layanan,
      COUNT(id_pasien) AS jumlah_kunjungan
    FROM pemeriksaan
    WHERE jenis_layanan IN (?)
  `;

  if (tahun) {
    query += ' AND YEAR(tanggal_pemeriksaan) = ?';
    params.push(tahun);
  }

  query += ' GROUP BY jenis_layanan';

  const [rows] = await db.query(query, params);

  // Hitung total kunjungan
  const totalKunjungan = rows.reduce((sum, row) => sum + row.jumlah_kunjungan, 0);

  // Map ke format respon dengan persentase
  const rekapData = rows.map((row) => ({
    layanan: row.jenis_layanan,
    jumlah_pasien: row.jumlah_kunjungan,
    persentase: totalKunjungan > 0
      ? parseFloat(((row.jumlah_kunjungan / totalKunjungan) * 100).toFixed(2))
      : 0
  }));

  return {
    total: totalKunjungan,
    data: rekapData
  };
};

module.exports = {
  getRekapLayanan
};