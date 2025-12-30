/**
 * Utilitas Respon API Standar
 * Menyediakan format respon yang konsisten untuk semua endpoint
 */

/**
 * Helper untuk respon sukses
 * @param {Object} res - Objek response Express
 * @param {string} message - Pesan sukses
 * @param {*} data - Data respon
 * @param {number} statusCode - Kode status HTTP (default: 200)
 */
const success = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Helper untuk respon 'Created' (HTTP 201)
 * @param {Object} res - Objek response Express
 * @param {string} message - Pesan sukses
 * @param {*} data - Data resource yang dibuat
 */
const created = (res, message, data = null) => {
  return success(res, message, data, 201);
};

/**
 * Helper untuk respon Error
 * @param {Object} res - Objek response Express
 * @param {string} message - Pesan error
 * @param {number} statusCode - Kode status HTTP (default: 500)
 * @param {*} errors - Detail error tambahan
 */
const error = (res, message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Helper untuk respon Bad Request (HTTP 400)
 */
const badRequest = (res, message, errors = null) => {
  return error(res, message, 400, errors);
};

/**
 * Helper untuk respon Unauthorized (HTTP 401)
 */
const unauthorized = (res, message = 'Akses ditolak. Silakan login terlebih dahulu.') => {
  return error(res, message, 401);
};

/**
 * Helper untuk respon Forbidden (HTTP 403)
 */
const forbidden = (res, message = 'Akses ditolak. Anda tidak memiliki izin.') => {
  return error(res, message, 403);
};

/**
 * Helper untuk respon Not Found (HTTP 404)
 */
const notFound = (res, message = 'Data tidak ditemukan.') => {
  return error(res, message, 404);
};

/**
 * Helper untuk respon Error Validasi (HTTP 400)
 * @param {Object} res - Objek response Express
 * @param {Array} errors - Array dari error validasi
 */
const validationError = (res, errors) => {
  return error(res, 'Validasi input gagal', 400, errors);
};

/**
 * Helper untuk respon Server Error (HTTP 500)
 */
const serverError = (res, message = 'Terjadi kesalahan server', err = null) => {
  // Log error untuk debugging (di production, gunakan logging yang proper)
  if (err) {
    console.error('[SERVER_ERROR]', err);
  }
  return error(res, message, 500, err ? { message: err.message, stack: err.stack } : null);
};

module.exports = {
  success,
  created,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  validationError,
  serverError
};
