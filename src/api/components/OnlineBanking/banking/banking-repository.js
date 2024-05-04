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
 * plus filter the data by finding the substring by using regex
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
  sortOfDataValue,
  searchPath,
  searchName
) {
  const sortValueOfDataValue = parseInt(sortOfDataValue);
  const regexName = new RegExp(searchName, 'i');

  if (searchPath === 'email') {
    if (sortPathOfDataValue == 'name') {
      return Account.find({ email: regexName })
        .limit(limitOfDataValue)
        .skip(offsetOfDataValue)
        .sort({ name: sortValueOfDataValue });
    } else if (sortPathOfDataValue == 'balance') {
      return Account.find({ email: regexName })
        .limit(limitOfDataValue)
        .skip(offsetOfDataValue)
        .sort({ balance: sortValueOfDataValue });
    } else if (sortPathOfDataValue == 'userName') {
      return Account.find({ email: regexName })
        .limit(limitOfDataValue)
        .skip(offsetOfDataValue)
        .sort({ userName: sortValueOfDataValue });
    } else {
      return Account.find({ email: regexName })
        .limit(limitOfDataValue)
        .skip(offsetOfDataValue)
        .sort({ email: sortValueOfDataValue });
    }
  }
  if (searchPath === 'name') {
    if (sortPathOfDataValue == 'name') {
      return Account.find({ name: regexName })
        .limit(limitOfDataValue)
        .skip(offsetOfDataValue)
        .sort({ name: sortValueOfDataValue });
    } else if (sortPathOfDataValue == 'balance') {
      return Account.find({ name: regexName })
        .limit(limitOfDataValue)
        .skip(offsetOfDataValue)
        .sort({ balance: sortValueOfDataValue });
    } else if (sortPathOfDataValue == 'userName') {
      return Account.find({ name: regexName })
        .limit(limitOfDataValue)
        .skip(offsetOfDataValue)
        .sort({ userName: sortValueOfDataValue });
    } else {
      return Account.find({ name: regexName })
        .limit(limitOfDataValue)
        .skip(offsetOfDataValue)
        .sort({ email: sortValueOfDataValue });
    }
  }
  if (searchPath === 'userName') {
    if (sortPathOfDataValue == 'name') {
      return Account.find({ userName: regexName })
        .limit(limitOfDataValue)
        .skip(offsetOfDataValue)
        .sort({ name: sortValueOfDataValue });
    } else if (sortPathOfDataValue == 'balance') {
      return Account.find({ userName: regexName })
        .limit(limitOfDataValue)
        .skip(offsetOfDataValue)
        .sort({ balance: sortValueOfDataValue });
    } else if (sortPathOfDataValue == 'userName') {
      return Account.find({ userName: regexName })
        .limit(limitOfDataValue)
        .skip(offsetOfDataValue)
        .sort({ userName: sortValueOfDataValue });
    } else {
      return Account.find({ userName: regexName })
        .limit(limitOfDataValue)
        .skip(offsetOfDataValue)
        .sort({ email: sortValueOfDataValue });
    }
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
 * Get Account by phone to prevent duplicate phoneNumber
 * @param {string} phoneNumber - phoneNumber
 * @returns {Promise}
 */
async function getAccountbyPhoneNumber(phoneNumber) {
  return Account.findOne({ phoneNumber });
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

/**List of function to update each value individually
 * @param {string} id - Account id
 * @param {string} name - name
 * @param {string} email - email
 * @param {string} address - address
 * @param {string} city - city
 * @param {number} phoneNumber - phone number
 */
async function updateName(id, name) {
  return Account.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
      },
    }
  );
}
async function updateEmail(id, email) {
  return Account.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        email,
      },
    }
  );
}
async function updateAddress(id, address) {
  return Account.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        address,
      },
    }
  );
}
async function updateCity(id, city) {
  return Account.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        city,
      },
    }
  );
}
async function updatePhoneNumber(id, phoneNumber) {
  return Account.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        phoneNumber,
      },
    }
  );
}

async function updateBalance(id, balance) {
  return Account.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        balance,
      },
    }
  );
}

module.exports = {
  getAccounts,
  getAccountById,
  getAccountByEmail,
  getAccountByUserName,
  getAccountbyPhoneNumber,
  getAccountByFilteringAndSorting,
  createAccount,
  deleteAccount,
  changePassword,
  updateName,
  updateEmail,
  updateAddress,
  updateCity,
  updatePhoneNumber,
  updateBalance,
};
