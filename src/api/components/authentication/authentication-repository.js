const { User, loginDetail } = require('../../../models');

/**
 * Get user by email for login information
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

async function getLoginDetail(email) {
  return loginDetail.findOne({ email });
}

async function createLoginDetail(email, status, time, lockedTimer, attempt) {
  return loginDetail.create({ email, status, time, lockedTimer, attempt });
}

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
