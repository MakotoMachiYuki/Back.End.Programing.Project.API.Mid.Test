const transactionRepository = require('./transaction-repository');
const accountRepository = require('../banking/banking-repository');

/**
 * Get a list of all transactions with sort order by most recent and put them into an array
 * @returns {Promise}
 */
async function getTransactionAll() {
  const fullTransaction = await transactionRepository.getTransactions();

  const resultsTransaction = [];

  for (let MACHI = 0; MACHI < fullTransaction.length; MACHI++) {
    const transaction = fullTransaction[MACHI];

    //filtering the schema for deposit, withdraw and transfer since all of them shared one database schema
    if (transaction.deposit != null) {
      resultsTransaction.push({
        userName: transaction.userName,
        old_balance: transaction.old_balance,
        current_balance: transaction.current_balance,
        deposit: transaction.deposit,
        time: transaction.time,
      });
    }
    if (transaction.withdraw != null) {
      resultsTransaction.push({
        userName: transaction.userName,
        old_balance: transaction.old_balance,
        current_balance: transaction.current_balance,
        withdraw: transaction.withdraw,
        time: transaction.time,
      });
    }
    if (transaction.userName_received != null) {
      resultsTransaction.push({
        userName: transaction.userName,
        userName_received: transaction.userName_received,
        transactionValue: transaction.transactionValue,
        time: transaction.time,
      });
    }
    if (transaction.userName_sender != null) {
      resultsTransaction.push({
        userName: transaction.userName,
        userName_sender: transaction.userName_sender,
        old_balance: transaction.old_balance,
        current_balance: transaction.current_balance,
        transactionValue: transaction.transactionValue,
        time: transaction.time,
      });
    }
  }
  return resultsTransaction;
}

/**
 * Get a list of an account's transactions with sort order by most recent and put them into an array
 * @param id
 * @returns {Promise}
 */
async function getTransactionPerUser(id) {
  const account = await accountRepository.getAccountById(id);

  const transactionAccount =
    await transactionRepository.getTransactionByUserName(account.userName);

  const resultsTransaction = [];
  for (let MACHI = 0; MACHI < transactionAccount.length; MACHI++) {
    const transaction = transactionAccount[MACHI];
    if (transaction.deposit != null) {
      resultsTransaction.push({
        old_balance: transaction.old_balance,
        current_balance: transaction.current_balance,
        deposit: transaction.deposit,
        time: transaction.time,
      });
    }
    if (transaction.withdraw != null) {
      resultsTransaction.push({
        old_balance: transaction.old_balance,
        current_balance: transaction.current_balance,
        withdraw: transaction.withdraw,
        time: transaction.time,
      });
    }
    if (transaction.userName_received != null) {
      resultsTransaction.push({
        userName_received: transaction.userName_received,
        transactionValue: transaction.transactionValue,
        time: transaction.time,
      });
    }
    if (transaction.userName_sender != null) {
      resultsTransaction.push({
        userName_sender: transaction.userName_sender,
        old_balance: transaction.old_balance,
        current_balance: transaction.current_balance,
        transactionValue: transaction.transactionValue,
        time: transaction.time,
      });
    }
  }
  return resultsTransaction;
}

module.exports = {
  getTransactionAll,
  getTransactionPerUser,
};
