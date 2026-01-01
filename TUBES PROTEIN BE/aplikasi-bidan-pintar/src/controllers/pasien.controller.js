/**
 * Controller Pasien
 * Menangani request HTTP untuk manajemen pasien
 */

const pasienService = require('../services/pasien.service');
const { success, created, notFound, badRequest, serverError } = require('../utils/response');

/**
 * Ambil semua data pasien
 * GET /api/pasien
 */
const getAllPasien = async (req, res) => {
  try {
    const { search } = req.query;
    const data = await pasienService.getAllPasien(search);
    return success(res, 'Berhasil mengambil data pasien', data);
  } catch (error) {
    return serverError(res, 'Gagal mengambil data pasien', error);
  }
};

/**
 * Ambil data pasien berdasarkan ID
 * GET /api/pasien/:id
 */
const getPasienById = async (req, res) => {
  try {
    const { id } = req.params;
    const pasien = await pasienService.getPasienById(id);

    if (!pasien) {
      return notFound(res, 'Pasien tidak ditemukan');
    }

    return success(res, 'Berhasil mengambil data pasien', pasien);
  } catch (error) {
    return serverError(res, 'Gagal mengambil data pasien', error);
  }
};

/**
 * Buat data pasien baru
 * POST /api/pasien
 */
const createPasien = async (req, res) => {
  try {
    const userId = req.user.id;
    const newPasien = await pasienService.createPasien(req.body, userId);
    return created(res, 'Pasien berhasil ditambahkan', newPasien);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return badRequest(res, 'NIK sudah terdaftar');
    }
    return serverError(res, 'Gagal menyimpan data pasien', error);
  }
};

/**
 * Update data pasien
 * PUT /api/pasien/:id
 */
const updatePasien = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Cek apakah pasien ada
    const existingPasien = await pasienService.getPasienById(id);
    if (!existingPasien) {
      return notFound(res, 'Pasien tidak ditemukan');
    }

    const updatedPasien = await pasienService.updatePasien(id, userId, req.body);
    return success(res, 'Data pasien berhasil diperbarui', updatedPasien);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return badRequest(res, 'NIK sudah terdaftar di pasien lain');
    }
    return serverError(res, 'Gagal memperbarui data pasien', error);
  }
};

/**
 * Hapus data pasien (Soft Delete)
 * DELETE /api/pasien/:id
 */
const deletePasien = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pasienService.deletePasien(id, userId);

    if (result.affectedRows === 0) {
      return notFound(res, 'Pasien tidak ditemukan');
    }

    return success(res, 'Pasien berhasil dihapus');
  } catch (error) {
    return serverError(res, 'Gagal menghapus pasien', error);
  }
};

/**
 * Ambil riwayat pemeriksaan pasien
 * GET /api/pasien/:id/riwayat
 */
const getRiwayatPasien = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah pasien ada
    const existingPasien = await pasienService.getPasienById(id);
    if (!existingPasien) {
      return notFound(res, 'Pasien tidak ditemukan');
    }

    const riwayat = await pasienService.getRiwayatPasien(id);
    return success(res, `Riwayat pemeriksaan untuk ${existingPasien.nama}`, riwayat);
  } catch (error) {
    return serverError(res, 'Gagal mengambil riwayat pasien', error);
  }
};

/**
 * Ambil pasien yang dihapus
 * GET /api/pasien/deleted
 */
const getDeletedPasien = async (req, res) => {
  try {
    const { search } = req.query;
    const data = await pasienService.getDeletedPasien(search);
    return success(res, 'Berhasil mengambil data pasien yang dihapus', data);
  } catch (error) {
    return serverError(res, 'Gagal mengambil data pasien yang dihapus', error);
  }
};

/**
 * Pulihkan pasien (Restore)
 * PUT /api/pasien/:id/restore
 */
const restorePasien = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Cek apakah pasien ada (meskipun dihapus) - kita perlu cara untuk cek by ID tanpa peduli status penghapusan
    // ATAU coba restore saja dan cek affectedRows
    const result = await pasienService.restorePasien(id, userId);

    if (result.affectedRows === 0) {
      return notFound(res, 'Pasien tidak ditemukan atau belum dihapus');
    }

    return success(res, 'Pasien berhasil dipulihkan');
  } catch (error) {
    return serverError(res, 'Gagal memulihkan pasien', error);
  }
};

/**
 * Hapus pasien permanen (Hard Delete)
 * DELETE /api/pasien/permanent/:id
 */
const deletePasienPermanent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pasienService.deletePasienPermanent(id, userId);

    if (result.affectedRows === 0) {
      return notFound(res, 'Pasien tidak ditemukan');
    }

    return success(res, 'Pasien berhasil dihapus permanen');
  } catch (error) {
    return serverError(res, 'Gagal menghapus pasien secara permanen', error);
  }
};

module.exports = {
  getAllPasien,
  getPasienById,
  createPasien,
  updatePasien,
  deletePasien,
  getRiwayatPasien,
  getDeletedPasien,
  restorePasien,
  deletePasienPermanent
};