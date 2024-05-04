const express = require('express');

const AdminAuthenticationMiddleWare = require('../../../middlewares/authentication-middleware');
const AccountAuthenticationMiddleware = require('../../../middlewares/bankingAuth-middleware');
const celebrate = require('../../../../core/celebrate-wrappers');
const accountControllers = require('./banking-controller');
const accountValidators = require('./banking-validator');
const transactionController = require('../transaction/transaction-controller');

const route = express.Router();

module.exports = (app) => {
  app.use('/banking', route);

  route.post(
    '/',
    celebrate(accountValidators.createAccount),
    accountControllers.createAccount
  );

  route.get('/', AdminAuthenticationMiddleWare, accountControllers.getAccounts);

  route.get(
    '/transaction/',
    AdminAuthenticationMiddleWare,
    transactionController.getTransactions
  );

  route.get(
    '/:id/transaction/',
    AdminAuthenticationMiddleWare,
    transactionController.getTransactionPerUser
  );

  route.get(
    '/:id',
    AccountAuthenticationMiddleware,
    accountControllers.getAccount
  );

  route.delete(
    '/:id',
    AccountAuthenticationMiddleware,
    accountControllers.deleteAccount
  );

  route.post(
    '/:id/change-password',
    AccountAuthenticationMiddleware,
    celebrate(accountValidators.changePassword),
    accountControllers.updatePassword
  );

  route.put(
    '/:id/update-account',
    AccountAuthenticationMiddleware,
    celebrate(accountValidators.updateAccount),
    accountControllers.updateAccount
  );

  route.patch(
    '/:id/deposit/',
    AccountAuthenticationMiddleware,
    celebrate(accountValidators.deposit),
    accountControllers.deposit
  );

  route.patch(
    '/:id/withdraw/',
    AccountAuthenticationMiddleware,
    celebrate(accountValidators.withdraw),
    accountControllers.withdraw
  );

  route.put(
    '/:id/transfer/',
    AccountAuthenticationMiddleware,
    celebrate(accountValidators.transfer),
    accountControllers.transfer
  );
};
