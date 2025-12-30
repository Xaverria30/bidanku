/**
 * Middleware Validasi Request
 * Menggunakan skema Joi untuk validasi input
 */

const { validationError } = require('../utils/response');

/**
 * Validasi body request berdasarkan skema Joi
 * @param {Object} schema - Skema validasi Joi
 * @returns {Function} Middleware Express
 */
const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.context?.key || 'unknown',
      message: detail.message.replace(/"/g, '')
    }));

    console.error('[VALIDATION_ERROR] Request body:', JSON.stringify(req.body, null, 2));
    console.error('[VALIDATION_ERROR] Error validasi:', JSON.stringify(errors, null, 2));

    return validationError(res, errors);
  }

  // Ganti body dengan nilai yang sudah divalidasi/disanitasi
  req.body = value;
  next();
};

/**
 * Validasi parameter query request
 * @param {Object} schema - Skema validasi Joi
 * @returns {Function} Middleware Express
 */
const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.context?.key || 'unknown',
      message: detail.message.replace(/"/g, '')
    }));

    return validationError(res, errors);
  }

  req.query = value;
  next();
};

/**
 * Validasi parameter route request (params)
 * @param {Object} schema - Skema validasi Joi
 * @returns {Function} Middleware Express
 */
const validateParams = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.params, {
    abortEarly: false
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.context?.key || 'unknown',
      message: detail.message.replace(/"/g, '')
    }));

    return validationError(res, errors);
  }

  req.params = value;
  next();
};

// Export default untuk kompatibilitas
module.exports = validateBody;

// Named exports
module.exports.validateBody = validateBody;
module.exports.validateQuery = validateQuery;
module.exports.validateParams = validateParams;
