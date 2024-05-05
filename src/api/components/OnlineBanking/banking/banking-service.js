const accountsRepository = require('./banking-repository');
const transactionRepository = require('../transaction/transaction-repository');
const { hashPassword, passwordMatched } = require('../../../../utils/password');

/**
 * Get a lists of accounts and return with pagination
 * @param {Number} numberOfPages
 * @param {Number} sizeofPages
 * @param {Number} searchSubString
 * @param {Number} sortSubString
 * @returns {Array}
 */
async function getAccounts(
  numberOfPages,
  sizeofPages,
  searchSubString,
  sortSubString
) {
  const accountsAllEveryone = await accountsRepository.getAccounts();

  if (
    (sizeofPages == null && numberOfPages == null) ||
    (sizeofPages == null && numberOfPages != null)
  ) {
    numberOfPages = 1;
    sizeofPages = accountsAllEveryone.length;
  }

  //initialize the page_number and page_size variable
  const [page_number, page_size] = [numberOfPages, sizeofPages];

  //initialize the first index of the data
  const firstOfData = (page_number - 1) * page_size;
  //initialize the last index of the data
  const endOfData = page_number * page_size;

  //if the search is empty, it'll return no data error
  if (searchSubString == null) {
    return 'NoSearchValue';
  }
  //assigning searchPath (email/name) and searchName variable
  const searchByName = searchSubString.split('=');
  const [searchPath, searchName] = searchByName[0].split(':');
  //if the search format is wrong  it'll return no data error
  if (searchName === '') {
    return 'NoSearchValue';
  }

  //if number of page is null
  if (numberOfPages == null && sizeofPages !== null) {
    const tempTotalPage = Math.ceil(accountsAllEveryone.length / sizeofPages);
    const tempResult = await printAllPage(
      tempTotalPage,
      sizeofPages,
      searchSubString,
      sortSubString
    );

    const results = [];
    for (let MACHI = 0; MACHI <= tempTotalPage; MACHI++) {
      if (tempResult[MACHI] === 'NoUserWithRequestSearch') {
        return 'NoUserWithRequestSearch';
      }
      if (tempResult[MACHI] != null) {
        results.push(tempResult[MACHI]);
      }
    }
    return results;
  }
  //assigning sorting (email(default)/name)
  if (sortSubString == null) {
    sortSubString = '=email:asc';
  }
  const sortByName = sortSubString.split('=');
  const [sortPath, tempsortValue] = sortByName[0].split(':');

  //the default ascending is 1 and descending is -1 for mongoose .sort() function
  let sortValue = 1;
  if (tempsortValue === 'desc') {
    sortValue = -1;
  }

  //get the users which is filtered by page number and page size + sort them too
  const filteredAccountArray =
    await accountsRepository.getAccountByFilteringAndSorting(
      page_size,
      firstOfData,
      sortPath,
      sortValue,
      searchPath,
      searchName
    );

  //asssigning specific values to all the variables below
  const count = accountsAllEveryone.length;
  const total_pages = Math.ceil(count / page_size);
  const has_previous_page = await previous_page(firstOfData);
  const has_next_page = await next_page(endOfData, count);

  if (page_number > total_pages) {
    return 'PageBeyond';
  }
  if (filteredAccountArray.length == 0) {
    return 'NoUserWithRequestSearch';
  }

  //initialize the pagination
  const paginationOfAllTheData = {
    page_number: page_number,
    page_size: page_size,
    count: count,
    total_pages: total_pages,
    has_previous_page: has_previous_page,
    has_next_page: has_next_page,
    data: [],
  };

  for (let MACHI = 0; MACHI < filteredAccountArray.length; MACHI++) {
    const tempAccountData = filteredAccountArray[MACHI];
    paginationOfAllTheData.data.push({
      id: tempAccountData.id,
      name: tempAccountData.name,
      userName: tempAccountData.userName,
      email: tempAccountData.email,
      address: tempAccountData.address,
      city: tempAccountData.city,
      phoneNumber: tempAccountData.phoneNumber,
      balance: tempAccountData.balance,
    });
  }

  return paginationOfAllTheData;
}
/**
 * Return true or false if there is previous page or not
 * @param {Number} firstOfData - first index of data to be push
 * @returns {Boolean}
 */
async function previous_page(firstOfData) {
  if (firstOfData > 0) {
    return true;
  } else {
    return false;
  }
}

/**
 * Return true or false if there is next page or not
 * @param {Number} endOfData - last index of data to be push
 * @param {Number} count - total users data
 * @returns {Boolean}
 */
async function next_page(endOfData, count) {
  if (endOfData <= count) {
    return true;
  } else {
    return false;
  }
}
/**
 * return all pages available from the database if the number of page isn't filled but page size is
 * @param {Number} total_pages
 * @param {Number} sizeofPages
 * @param {String} searchSubString
 * @param {String} sortSubString
 * @returns {Array}
 */
async function printAllPage(
  total_pages,
  sizeofPages,
  searchSubString,
  sortSubString
) {
  const testTemp = [];

  for (let MACHI = 1; MACHI <= total_pages; MACHI++) {
    testTemp[MACHI] = await getAccounts(
      MACHI,
      sizeofPages,
      searchSubString,
      sortSubString
    );
  }

  return testTemp;
}
/**
 * Create an account with the given variables
 * @param {string} name
 * @param {string} userName
 * @param {string} email
 * @param {string} password
 * @param {string} address
 * @param {string} city
 * @param {number} phoneNumber
 * @returns
 */
async function createAccount(
  name,
  userName,
  email,
  password,
  address,
  city,
  phoneNumber
) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    const balance = 0;
    await accountsRepository.createAccount(
      name,
      userName,
      email,
      hashedPassword,
      address,
      city,
      phoneNumber,
      balance
    );
  } catch (err) {
    return null;
  }

  return true;
}
/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const account = await accountsRepository.getAccountByEmail(email);

  if (account) {
    return true;
  }

  return false;
}
/**
 * Check whether the userName is registered
 * @param {string} userName - userName
 * @returns {boolean}
 */
async function userNameIsRegistered(userName) {
  const account = await accountsRepository.getAccountByUserName(userName);

  if (account) {
    return true;
  }

  return false;
}
/**
 * Check whether the phoneNumber is registered
 * @param {string} phoneNumber - phoneNumber
 * @returns {boolean}
 */
async function phoneNumberIsRegistered(phoneNumber) {
  const account = await accountsRepository.getAccountbyPhoneNumber(phoneNumber);

  if (account) {
    return true;
  }

  return false;
}

/**
 * Get an account detail by id
 * @param {string} id - account ID
 * @returns {Object}
 */
async function getAccount(id) {
  const account = await accountsRepository.getAccountById(id);

  // User not found
  if (!account) {
    return null;
  }

  return {
    name: account.name,
    userName: account.userName,
    email: account.email,
    address: account.address,
    city: account.city,
    phoneNumber: account.phoneNumber,
    balance: account.balance,
  };
}

/**
 * Delete account
 * @param {string} id - account ID
 * @returns {boolean}
 */
async function deleteAccount(id) {
  const account = await accountsRepository.getAccountById(id);

  // User not found
  if (!account) {
    return null;
  }

  try {
    await accountsRepository.deleteAccount(id);
  } catch (err) {
    return null;
  }

  return true;
}
/**
 * Change account password
 * @param {string} id - account id
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(id, password) {
  const account = await accountsRepository.getAccountById(id);

  // Check if account not found
  if (!account) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await accountsRepository.changePassword(
    id,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}
/**
 * Check whether the password is correct
 * @param {string} id - account ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(id, password) {
  const account = await accountsRepository.getAccountById(id);

  const accountPassword = account
    ? account.password
    : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, accountPassword);

  if (passwordChecked && account) {
    return true;
  } else {
    return null;
  }
}
/**
 * Update the account data, but also can be done for each individual variable only
 * @param {string} id
 * @param {string} name
 * @param {string} email
 * @param {string} address
 * @param {string} city
 * @param {string} phoneNumber
 * @returns {boolean}
 */
async function updateAccount(id, name, email, address, city, phoneNumber) {
  const account = await accountsRepository.getAccountById(id);
  if (!account) {
    return 'NoAccount';
  }

  try {
    if (name !== null) {
      await accountsRepository.updateName(id, name);
    }
    if (email !== null) {
      await accountsRepository.updateEmail(id, email);
    }
    if (address !== null) {
      await accountsRepository.updateAddress(id, address);
    }
    if (city !== null) {
      await accountsRepository.updateCity(id, city);
    }
    if (phoneNumber !== null) {
      await accountsRepository.updatePhoneNumber(id, phoneNumber);
    }
    return true;
  } catch (error) {
    return null;
  }
}
/**
 * Deposit (insert) the money value into the account's database
 * @param {String} id
 * @param {Number} moneyValue
 * @returns {Number}
 */
async function deposit(id, moneyValue) {
  const account = await accountsRepository.getAccountById(id);

  const old_balance = account.balance;

  const current_balance = old_balance + moneyValue;

  try {
    await accountsRepository.updateBalance(id, current_balance);

    //records the deposit
    await transactionRepository.transactionDeposit(
      account.userName,
      old_balance,
      current_balance,
      moneyValue
    );

    return [old_balance, current_balance];
  } catch (error) {
    return null;
  }
}

/**
 * Withdraw (subtract) the money value from the account's database
 * @param {String} id
 * @param {Number} moneyValue
 * @returns {Number}
 */
async function withdraw(id, moneyValue) {
  const account = await accountsRepository.getAccountById(id);

  const old_balance = parseFloat(account.balance);

  if (old_balance == 0) {
    return 'noMoney';
  }

  //if the user want to withdraw more money from they had in the database, they will re
  let current_balance = old_balance - moneyValue;
  if (current_balance < 0) {
    current_balance = 0;
  }

  try {
    await accountsRepository.updateBalance(id, current_balance);

    //records the withdraw
    await transactionRepository.transactionWithdraw(
      account.userName,
      old_balance,
      current_balance,
      moneyValue
    );

    return [old_balance, current_balance];
  } catch (error) {
    return null;
  }
}
/**
 * Transfer the money from an account to another account
 * @param {String} id - id who is sending the money
 * @param {String} userName - username who will receive the money
 * @param {Number} moneyValue - the amount of transfer
 * @returns {Number}
 */
async function transfer(id, userName, moneyValue) {
  const ownAccount = await accountsRepository.getAccountById(id);
  const targetAccount = await accountsRepository.getAccountByUserName(userName);

  const old_balance = parseFloat(ownAccount.balance);

  if (old_balance == 0 || old_balance < moneyValue) {
    return 'NoEnoughMoney';
  }

  if (!targetAccount) {
    return 'NoTargetAccount';
  }

  const targetBalanceNow = parseFloat(targetAccount.balance);

  const targetBalanceNew = targetBalanceNow + moneyValue;
  const current_balance = old_balance - moneyValue;

  try {
    await accountsRepository.updateBalance(id, current_balance);
    await accountsRepository.updateBalance(targetAccount.id, targetBalanceNew);

    //records the transactions for the sender
    await transactionRepository.transactionTransferSender(
      ownAccount.userName,
      targetAccount.userName,
      moneyValue
    );
    //records the transactions for the received
    await transactionRepository.transactionTranferReceived(
      targetAccount.userName,
      ownAccount.userName,
      targetBalanceNow,
      targetBalanceNew,
      moneyValue
    );

    return [old_balance, current_balance, moneyValue];
  } catch (error) {
    return null;
  }
}

module.exports = {
  getAccounts,
  getAccount,
  deleteAccount,
  createAccount,
  emailIsRegistered,
  userNameIsRegistered,
  phoneNumberIsRegistered,
  changePassword,
  checkPassword,
  updateAccount,
  deposit,
  withdraw,
  transfer,
};
