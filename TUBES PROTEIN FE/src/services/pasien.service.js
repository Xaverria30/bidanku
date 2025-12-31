/**
 * Service Pasien - Panggilan API manajemen pasien
 */

import { apiRequest } from './api';

/**
 * Ambil semua pasien dengan pencarian opsional
 * @param {string} search - Cari berdasarkan nama atau NIK
 * @returns {Promise<object>} Data respons dengan daftar pasien
 */
export const getAllPasien = async (search = '') => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiRequest(`/pasien${query}`);
};

/**
 * Ambil pasien berdasarkan ID
 * @param {string} id - ID Pasien (UUID)
 * @returns {Promise<object>} Data respons dengan detail pasien
 */
export const getPasienById = async (id) => {
  return apiRequest(`/pasien/${id}`);
};

/**
 * Buat pasien baru
 * @param {object} data - { nama, NIK, umur, alamat, no_hp }
 * @returns {Promise<object>} Data respons dengan pasien yang dibuat
 */
export const createPasien = async (data) => {
  return apiRequest('/pasien', {
    method: 'POST',
    body: data,
  });
};

/**
 * Update data pasien
 * @param {string} id - ID Pasien (UUID)
 * @param {object} data - { nama, NIK, umur, alamat, no_hp }
 * @returns {Promise<object>} Data respons dengan pasien yang diperbarui
 */
export const updatePasien = async (id, data) => {
  return apiRequest(`/pasien/${id}`, {
    method: 'PUT',
    body: data,
  });
};

/**
 * Hapus pasien
 * @param {string} id - ID Pasien (UUID)
 * @returns {Promise<object>} Data respons
 */
export const deletePasien = async (id) => {
  return apiRequest(`/pasien/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Ambil riwayat medis pasien
 * @param {string} id - ID Pasien (UUID)
 * @returns {Promise<object>} Data respons dengan riwayat medis
 */
export const getRiwayatPasien = async (id) => {
  return apiRequest(`/pasien/${id}/riwayat`);
};

/**
 * Ambil pasien yang dihapus (Data Sampah)
 * @param {string} search - Query pencarian
 * @returns {Promise<object>} Data respons
 */
export const getDeletedPasien = async (search = '') => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiRequest(`/pasien/deleted${query}`);
};

/**
 * Pulihkan pasien
 * @param {string} id - ID Pasien
 * @returns {Promise<object>} Data respons
 */
export const restorePasien = async (id) => {
  return apiRequest(`/pasien/${id}/restore`, {
    method: 'PUT',
  });
};

export default {
  getAllPasien,
  getPasienById,
  createPasien,
  updatePasien,
  deletePasien,
  getRiwayatPasien,
  getDeletedPasien,
  restorePasien,
};
