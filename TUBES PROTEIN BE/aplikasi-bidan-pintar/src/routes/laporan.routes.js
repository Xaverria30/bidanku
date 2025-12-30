/**
 * Rute Laporan
 * Rute yang dilindungi untuk pembuatan dan pengelolaan laporan
 */

const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporan.controller');
const { verifyToken } = require('../middleware/auth');

// Semua rute membutuhkan autentikasi
router.use(verifyToken);

// Endpoint Laporan
router.get('/summary', laporanController.getSummary);           // Ambil summary & data dashboard
router.get('/list', laporanController.getLaporanList);         // Ambil daftar ringkasan laporan
router.get('/export', laporanController.generateLaporanBulanan); // Generate Excel (parameter query)
router.get('/:id', laporanController.getLaporanById);           // Ambil satu laporan berdasarkan ID
router.post('/', laporanController.createLaporan);              // Buat laporan baru
router.put('/:id', laporanController.updateLaporan);            // Update laporan
router.delete('/:id', laporanController.deleteLaporan);         // Hapus laporan

// Support Legacy - tetap simpan GET / untuk generate Excel
router.get('/', laporanController.generateLaporanBulanan);

module.exports = router;