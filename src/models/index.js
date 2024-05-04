const mongoose = require('mongoose');
const config = require('../core/config');
const logger = require('../core/logger')('app');

const usersSchema = require('./users-schema');
const loginDetailSchema = require('./loginDetail-schema');
const transactionHistory = require('./BankingSchema.js/transcationHistory-schema');
const account = require('./BankingSchema.js/account-schema');
const accountLoginDetail = require('./BankingSchema.js/accountLoginDetail-schema');

mongoose.connect(`${config.database.connection}/${config.database.name}`, {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.once('open', () => {
  logger.info('Successfully connected to MongoDB');
});

const User = mongoose.model('users', mongoose.Schema(usersSchema));
const loginDetail = mongoose.model(
  'loginDetail',
  mongoose.Schema(loginDetailSchema)
);
const Transaction = mongoose.model(
  'Transaction_History',
  mongoose.Schema(transactionHistory)
);
const Account = mongoose.model('Account_Details', mongoose.Schema(account));

const AccountloginDetail = mongoose.model(
  'Account_Login',
  mongoose.Schema(accountLoginDetail)
);
module.exports = {
  mongoose,
  User,
  loginDetail,
  Transaction,
  Account,
  AccountloginDetail,
};
