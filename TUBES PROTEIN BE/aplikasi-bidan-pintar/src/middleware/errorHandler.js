/**
 * Middleware Penanganan Error Global
 * Penanganan error terpusat untuk aplikasi
 */

const { AppError } = require('../utils/errors');

/**
 * Menangani error duplikasi MySQL
 */
const handleDuplicateError = (err) => {
  const message = err.sqlMessage?.includes('username')
    ? 'Username sudah digunakan'
    : err.sqlMessage?.includes('email')
      ? 'Email sudah terdaftar'
      : err.sqlMessage?.includes('nik')
        ? 'NIK sudah terdaftar'
        : 'Data sudah ada';
  return { statusCode: 400, message };
};

/**
 * Menangani error token JWT
 */
const handleJWTError = () => ({
  statusCode: 401,
  message: 'Token tidak valid. Silakan login kembali.'
});

/**
 * Menangani error token JWT kadaluarsa
 */
const handleJWTExpiredError = () => ({
  statusCode: 401,
  message: 'Token sudah kadaluarsa. Silakan login kembali.'
});

/**
 * Middleware error handler global
 */
const errorHandler = (err, req, res, next) => {
  // Log error untuk debugging
  console.error('[ERROR]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Terjadi kesalahan server';
  let errors = err.errors || null;

  // Menangani tipe error spesifik
  if (err.code === 'ER_DUP_ENTRY') {
    const handled = handleDuplicateError(err);
    statusCode = handled.statusCode;
    message = handled.message;
  } else if (err.name === 'JsonWebTokenError') {
    const handled = handleJWTError();
    statusCode = handled.statusCode;
    message = handled.message;
  } else if (err.name === 'TokenExpiredError') {
    const handled = handleJWTExpiredError();
    statusCode = handled.statusCode;
    message = handled.message;
  }

  // Jangan bocorkan detail error di production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Terjadi kesalahan server';
  }

  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  // Sertakan stack trace di development
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Handler 404 Not Found untuk rute yang tidak terdefinisi
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Rute ${req.method} ${req.originalUrl} tidak ditemukan`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
