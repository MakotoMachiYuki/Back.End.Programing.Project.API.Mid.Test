const { Transaction } = require('../../../../models');

/**
 * Get a list of transactions
 * @returns {Promise}
 */
async function getTransactions() {
  return Transaction.find({}).sort({ time: -1 });
}

/**
 * Get a list of transaction by username
 * @param {string} userName
 * @returns
 */
async function getTransactionByUserName(userName) {
  return Transaction.find({ userName: userName }).sort({ time: -1 });
}

/**
 * Create a new transaction record of the account's deposit request
 * @param {String} userName
 * @param {Number} old_balance
 * @param {Number} current_balance
 * @param {Number} deposit
 * @returns {Promise}
 */
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
/**
 * Create a new transaction record of the account's withdraw request
 * @param {String} userName
 * @param {Number} old_balance
 * @param {Number} current_balance
 * @param {Number} withdraw
 * @returns {Promise}
 */
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

/**
 * create a record of transaction done by the sender
 * @param {String} userName
 * @param {Number} userName_received
 * @param {Number} transactionValue
 * @returns
 */
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
/**
 * create a record of transaction for the received transfer from the sender
 * @param {String} userName
 * @param {String} userName_sender
 * @param {Number} old_balance
 * @param {Number} current_balance
 * @param {Number} transactionValue
 * @returns
 */
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
