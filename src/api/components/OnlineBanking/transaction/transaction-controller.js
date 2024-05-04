const transactionService = require('./transaction-service');
const { errorResponder, errorTypes } = require('../../../../core/errors');

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
