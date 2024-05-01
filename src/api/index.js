const express = require('express');

const authentication = require('./components/authentication/authentication-route');
const users = require('./components/users/users-route');
const bankingAuth = require('./components/OnlineBanking/banking-authentication/bankingAuth-route');
const banking = require('./components/OnlineBanking/banking/banking-route');

module.exports = () => {
  const app = express.Router();

  authentication(app);
  users(app);
  bankingAuth(app);
  banking(app);

  return app;
};
