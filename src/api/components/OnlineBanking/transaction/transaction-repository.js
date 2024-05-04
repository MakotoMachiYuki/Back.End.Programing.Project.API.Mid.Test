const { Transaction } = require('../../../../models');

/**
 * Get a list of accounts
 * @returns {Promise}
 */
async function getTransactions() {
  return Transaction.find({}).sort({ time: -1 });
}

async function getTransactionByUserName(userName) {
  return Transaction.find({ userName: userName }).sort({ time: -1 });
}

async function transactionDeposit(
  userName,
  old_balance,
  current_balance,
  deposit
) {
  const time = new Date().toString();
  return Transaction.create({
    userName,
    old_balance,
    current_balance,
    deposit,
    time,
  });
}

async function transactionWithdraw(
  userName,
  old_balance,
  current_balance,
  withdraw
) {
  const time = new Date().toString();
  return Transaction.create({
    userName,
    old_balance,
    current_balance,
    withdraw,
    time,
  });
}

async function transactionTransferSender(
  userName,
  userName_received,
  transactionValue
) {
  const time = new Date().toString();
  return Transaction.create({
    userName,
    userName_received,
    transactionValue,
    time,
  });
}

async function transactionTranferReceived(
  userName,
  userName_sender,
  old_balance,
  current_balance,
  transactionValue
) {
  const time = new Date().toString();
  return Transaction.create({
    userName,
    userName_sender,
    old_balance,
    current_balance,
    transactionValue,
    time,
  });
}

module.exports = {
  getTransactions,
  getTransactionByUserName,
  transactionDeposit,
  transactionWithdraw,
  transactionTranferReceived,
  transactionTransferSender,
};
