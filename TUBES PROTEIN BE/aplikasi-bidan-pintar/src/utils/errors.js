/**
 * Kelas Error Kustom
 * Penanganan error standar di seluruh aplikasi
 */

/**
 * Error Aplikasi Dasar
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error Permintaan Tidak Valid (400)
 */
class BadRequestError extends AppError {
  constructor(message = 'Permintaan tidak valid') {
    super(message, 400);
  }
}

/**
 * Error Tidak Terotorisasi (401)
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Akses ditolak. Silakan login terlebih dahulu.') {
    super(message, 401);
  }
}

/**
 * Error Terlarang (403)
 */
class ForbiddenError extends AppError {
  constructor(message = 'Akses ditolak. Anda tidak memiliki izin.') {
    super(message, 403);
  }
}

/**
 * Error Tidak Ditemukan (404)
 */
class NotFoundError extends AppError {
  constructor(message = 'Data tidak ditemukan') {
    super(message, 404);
  }
}

/**
 * Error Konflik (409) - untuk entri duplikat
 */
class ConflictError extends AppError {
  constructor(message = 'Data sudah ada') {
    super(message, 409);
  }
}

/**
 * Error Validasi (400)
 */
class ValidationError extends AppError {
  constructor(message = 'Validasi gagal', errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError
};
