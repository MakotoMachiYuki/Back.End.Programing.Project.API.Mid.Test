const { Account } = require('../../../../models');

/**
 * Get a list of accounts
 * @returns {Promise}
 */
async function getAccounts() {
  return Account.find({});
}

/**
 * Get Account detail
 * @param {string} id - Account ID
 * @returns {Promise}
 */
async function getAccountById(id) {
  return Account.findById(id);
}

/**
 * get a list of Accounts by the limit of page size, where the data started (offset)
 * @param {Integer} limitOfDataValue - page Size
 * @param {Integer} offsetOfDataValue - where the data started
 * @param {Integer} sortPathOfDataValue - path for sorting
 * @param {Integer} sortOfDataValue - sort by ascending or descending
 * @returns {Promise}
 */
async function getAccountByFilteringAndSorting(
  limitOfDataValue,
  offsetOfDataValue,
  sortPathOfDataValue,
  sortOfDataValue
) {
  const sortValueOfDataValue = parseInt(sortOfDataValue);
  if (sortPathOfDataValue == 'name') {
    return Account.find({})
      .limit(limitOfDataValue)
      .skip(offsetOfDataValue)
      .sort({ name: sortValueOfDataValue });
  } else {
    return Account.find({})
      .limit(limitOfDataValue)
      .skip(offsetOfDataValue)
      .sort({ email: sortValueOfDataValue });
  }
}

/**
 * Create new Account
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createAccount(
  name,
  userName,
  email,
  password,
  address,
  city,
  phoneNumber,
  balance
) {
  return Account.create({
    name,
    userName,
    email,
    password,
    address,
    city,
    phoneNumber,
    balance,
  });
}

/**
 * Get Account by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getAccountByEmail(email) {
  return Account.findOne({ email });
}
/**
 * Get Account by userName to prevent duplicate userName
 * @param {string} userName - userName
 * @returns {Promise}
 */
async function getAccountByUserName(userName) {
  return Account.findOne({ userName });
}

/**
 * Update existing Account
 * @param {string} id - Account ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateAccount(id, name, email) {
  return Account.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a Account
 * @param {string} id - Account ID
 * @returns {Promise}
 */
async function deleteAccount(id) {
  return Account.deleteOne({ _id: id });
}

/**
 * Update Account password
 * @param {string} id - Account ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return Account.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getAccounts,
  getAccountById,
  getAccountByEmail,
  getAccountByUserName,
  getAccountByFilteringAndSorting,
  createAccount,
};
