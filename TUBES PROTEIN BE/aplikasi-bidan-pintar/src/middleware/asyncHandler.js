/**
 * Wrapper Async Handler
 * Membungkus route handler async untuk menangkap error secara otomatis
 */

/**
 * Bungkus fungsi async untuk menangkap error dan meneruskannya ke error handler
 * @param {Function} fn - Fungsi async yang akan dibungkus
 * @returns {Function} Fungsi middleware Express
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
