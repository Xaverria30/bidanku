/**
 * Route Pasien
 * Route yang dilindungi untuk manajemen pasien
 */

const express = require('express');
const router = express.Router();
const pasienController = require('../controllers/pasien.controller');
const { verifyToken } = require('../middleware/auth');
const validate = require('../middleware/validator.middleware');
const { PasienSchema } = require('../validators/pasien.validator');

// Semua route membutuhkan autentikasi
router.use(verifyToken);

// Operasi CRUD Pasien
// Route spesial (diletakkan di awal sebelum parameter :id)
router.get('/deleted', pasienController.getDeletedPasien);
router.put('/:id/restore', pasienController.restorePasien);

// Operasi CRUD Pasien
router.get('/', pasienController.getAllPasien);
router.get('/:id', pasienController.getPasienById);
router.post('/', validate(PasienSchema), pasienController.createPasien);
router.put('/:id', validate(PasienSchema), pasienController.updatePasien);
router.delete('/:id', pasienController.deletePasien);

// Riwayat pasien
router.get('/:id/riwayat', pasienController.getRiwayatPasien);

module.exports = router;