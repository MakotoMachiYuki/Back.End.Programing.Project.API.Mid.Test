const express = require('express');

const AdminAuthenticationMiddleWare = require('../../../middlewares/authentication-middleware');
const AccountAuthenticationMiddleware = require('../../../middlewares/bankingAuth-middleware');
const celebrate = require('../../../../core/celebrate-wrappers');
const accountControllers = require('./banking-controller');
const accountValidators = require('./banking-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/banking', route);

  route.post(
    '/',
    AdminAuthenticationMiddleWare,
    celebrate(accountValidators.createAccount),
    accountControllers.createAccount
  );

  route.get('/', AdminAuthenticationMiddleWare, accountControllers.getAccounts);
};
