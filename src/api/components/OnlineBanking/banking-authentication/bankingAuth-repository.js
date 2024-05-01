const { Account, AccountloginDetail } = require('../../../../models/');

async function getAccountByUserName(userName) {
  return Account.findOne({ userName });
}

/**
 * Get user login detail by email
 * @param {String} email - Email
 * @returns
 */
async function getLoginDetail(userName) {
  return AccountloginDetail.findOne({ userName });
}

/**
 * Record account's login detail in the database
 * @param {String} userName
 * @param {String} status
 * @param {Number} time
 * @param {Number} lockedTimer
 * @param {Number} attempt
 * @returns {Promise}
 */
async function createAccountloginDetail(
  userName,
  status,
  time,
  lockedTimer,
  attempt
) {
  return AccountloginDetail.create({
    userName,
    status,
    time,
    lockedTimer,
    attempt,
  });
}

/**
 * update account's login detail in the database
 * @param {String} userName
 * @param {String} status
 * @param {Number} time
 * @param {Number} lockedTimer
 * @param {Number} attempt
 * @returns {Promise}
 */
async function updateAccountloginDetail(
  userName,
  status,
  time,
  lockedTimer,
  attempt
) {
  return AccountloginDetail.updateOne(
    {
      userName: userName,
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
  getAccountByUserName,
  createAccountloginDetail,
  updateAccountloginDetail,
  getLoginDetail,
};
