const express = require('express');

const bankingAuthControllers = require('./bankingAuth-controller');
const bankingAuthValidators = require('./bankingAuth-validator');
const celebrate = require('../../../../core/celebrate-wrappers');

const route = express.Router();

module.exports = (app) => {
  app.use('/banking', route);

  route.post(
    '/login',
    celebrate(bankingAuthValidators.login),
    bankingAuthControllers.accountlogin
  );
};
