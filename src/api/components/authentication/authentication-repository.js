const { User, loginDetail } = require('../../../models');

/**
 * Get user by email for login information
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Get user login detail by email
 * @param {String} email - Email
 * @returns
 */
async function getLoginDetail(email) {
  return loginDetail.findOne({ email });
}

/**
 * Record user's login detail in the database
 * @param {String} email
 * @param {String} status
 * @param {Number} time
 * @param {Number} lockedTimer
 * @param {Number} attempt
 * @returns {Promise}
 */
async function createLoginDetail(email, status, time, lockedTimer, attempt) {
  return loginDetail.create({ email, status, time, lockedTimer, attempt });
}

/**
 * update user's login detail in the database
 * @param {String} email
 * @param {String} status
 * @param {Number} time
 * @param {Number} lockedTimer
 * @param {Number} attempt
 * @returns {Promise}
 */
async function updateLoginDetail(email, status, time, lockedTimer, attempt) {
  return loginDetail.updateOne(
    {
      email: email,
    },
    {
      $set: {
        status,
        time,
        lockedTimer,
        attempt,
      },
    }
  );
}

module.exports = {
  getUserByEmail,
  getLoginDetail,
  createLoginDetail,
  updateLoginDetail,
};
