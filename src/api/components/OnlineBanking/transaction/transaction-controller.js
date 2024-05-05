const transactionService = require('./transaction-service');
const { errorResponder, errorTypes } = require('../../../../core/errors');

/**
 * Handle get list of transactions request
 * @param {object} request - Express request object
 * @param {object} response - Express request object
 * @param {object} next - Express request object
 * @returns {object} Response object or pass an error to the next route
 */
async function getTransactions(request, response, next) {
  try {
    const transaction = await transactionService.getTransactionAll();

    if (!transaction) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to get the list of Transactions!'
      );
    }

    return response.status(200).json({ transaction });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get list of transaction by user ID
 * @param {object} request - Express request object
 * @param {object} response - Express request object
 * @param {object} next - Express request object
 * @returns {object} Response object or pass an error to the next route
 */
async function getTransactionPerUser(request, response, next) {
  try {
    const transaction = await transactionService.getTransactionPerUser(
      request.params.id
    );

    if (!transaction) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to get the list of Transactions!'
      );
    }

    return response.status(200).json({ transaction });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getTransactions,
  getTransactionPerUser,
};
