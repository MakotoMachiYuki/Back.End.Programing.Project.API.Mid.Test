const { User } = require('../../../models');

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers() {
  return User.find({});
}

/**
 * get a list of users by the limit of page size, where the data started (offset)
 * @param {Integer} limitOfDataValue - page Size
 * @param {Integer} offsetOfDataValue - where the data started
 * @param {Integer} sortPathOfDataValue - path for sorting
 * @param {Integer} sortOfDataValue - sort by ascending or descending
 * @returns {Promise}
 */
async function getUserByFilteringAndSorting(
  limitOfDataValue,
  offsetOfDataValue,
  sortPathOfDataValue,
  sortOfDataValue
) {
  const sortValueOfDataValue = parseInt(sortOfDataValue);
  if (sortPathOfDataValue == 'name') {
    return User.find({})
      .limit(limitOfDataValue)
      .skip(offsetOfDataValue)
      .sort({ name: sortValueOfDataValue });
  } else {
    return User.find({})
      .limit(limitOfDataValue)
      .skip(offsetOfDataValue)
      .sort({ email: sortValueOfDataValue });
  }
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  return User.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
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
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
  getUserByFilteringAndSorting,
};
