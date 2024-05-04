const transactionRepository = require('./transaction-repository');
const accountRepository = require('../banking/banking-repository');

async function getTransactionAll() {
  const fullTransaction = await transactionRepository.getTransactions();

  const resultsTransaction = [];

  for (let i = 0; i < fullTransaction.length; i++) {
    const transaction = fullTransaction[i];

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

async function getTransactionPerUser(id) {
  const account = await accountRepository.getAccountById(id);

  const transactionAccount =
    await transactionRepository.getTransactionByUserName(account.userName);

  const resultsTransaction = [];
  for (let i = 0; i < transactionAccount.length; i++) {
    const transaction = transactionAccount[i];
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
