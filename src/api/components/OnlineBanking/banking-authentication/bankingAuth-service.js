const bankingAuthRepository = require('./bankingAuth-repository');
const { generateToken } = require('../../../../utils/session-token');
const { passwordMatched } = require('../../../../utils/password');

/**
 * Check accountname and password for login.
 * @param {string} userName - userName
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the userName and password are matched. Otherwise returns null.
 */
async function checkAccountLoginCredentials(userName, password, time) {
  const account = await bankingAuthRepository.getAccountByUserName(userName);

  // We define default account password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the account login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const accountPassword = account
    ? account.password
    : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, accountPassword);

  // Because we always check the password (see above comment), we define the
  // login attempt as successful when the `account` is found (by userName) and
  // the password matches.

  if (account && passwordChecked) {
    const status = 'login success';
    const attempt = 0;
    const lockedTimer = 0;

    //to check if account has ever login or not before
    const checkuserName = await bankingAuthRepository.getLoginDetail(userName);
    if (checkuserName == null) {
      await bankingAuthRepository.createAccountloginDetail(
        userName,
        status,
        time,
        lockedTimer,
        attempt
      );
    } else {
      const checkStatus = checkuserName.status;
      if (checkStatus === 'locked') {
        return 'PasswordWrong';
      }
      await bankingAuthRepository.updateAccountloginDetail(
        userName,
        status,
        time,
        lockedTimer,
        attempt
      );
    }

    return {
      userName: account.userName,
      name: account.name,
      account_id: account.id,
      token: generateToken(account.userName, account.id),
    };
  }

  if (!account) {
    return 'Noaccount';
  }

  return 'PasswordWrong';
}

/**
 * Function that will check the attempts, the time, resetting it
 * @param {String} userName
 * @param {String} time
 * @returns {object}
 */
async function checkAccountLoginAttempt(userName, time) {
  let status = 'login failed';
  const attemptLimit = 5;
  const timeLimit = 30; //30 minutes

  //to  check if account has ever login or not before
  const checkuserName = await bankingAuthRepository.getLoginDetail(userName);
  if (checkuserName == null) {
    await bankingAuthRepository.createAccountloginDetail(
      userName,
      status,
      time,
      0,
      0
    );
  } else {
    await bankingAuthRepository.updateAccountloginDetail(
      userName,
      status,
      time
    );
  }

  const accountLoginDetail =
    await bankingAuthRepository.getLoginDetail(userName);
  //everytime account input the wrong password, the total attempt from the database will be plus one
  const tempAttempt = parseInt(accountLoginDetail.attempt) + 1;

  if (
    tempAttempt <= attemptLimit &&
    accountLoginDetail.lockedTimer === 0 &&
    accountLoginDetail.status !== 'locked'
  ) {
    await bankingAuthRepository.updateAccountloginDetail(
      userName,
      status,
      time,
      0,
      tempAttempt
    );

    return ['InvalidTry', tempAttempt];
  }
  //when the attempt is beyond the limit it will locked the account and record the time when it can be unlocked
  if (tempAttempt > attemptLimit) {
    if (accountLoginDetail.lockedTimer === 0) {
      const tempStatus = 'locked';
      const newlockedTimer = Date.now() + 60000 * timeLimit;
      await bankingAuthRepository.updateAccountloginDetail(
        userName,
        tempStatus,
        time,
        newlockedTimer,
        tempAttempt
      );
      return ['LimitReached', timeLimit];
    }
    //it will give account timer update respone per minutes
    if (accountLoginDetail.lockedTimer !== 0) {
      if (Date.now() <= accountLoginDetail.lockedTimer) {
        const lockedTimer = accountLoginDetail.lockedTimer;
        const tempStatus = 'locked';
        const timeLeft = Math.ceil(
          (accountLoginDetail.lockedTimer - Date.now()) / 60000
        );
        await bankingAuthRepository.updateAccountloginDetail(
          userName,
          tempStatus,
          time,
          lockedTimer,
          tempAttempt
        );

        return ['LimitReached', timeLeft];
      }
      //when the time right now is already past the lockedTimer, it will unlocked the acc and reset the login attempts
      if (Date.now() > accountLoginDetail.lockedTimer) {
        const tempstatus = 'unlocked';
        await bankingAuthRepository.updateAccountloginDetail(
          userName,
          tempstatus,
          time,
          0,
          0
        );
        return 'AttemptReset';
      }
    }
  }
}

/**
 * function that will check if the account has an attempted try to login or not, and check the time
 * if it's already beyond 30 minutes, then it'll reset the attempts
 * @param {String} userName
 * @param {String} time
 */
async function checkAccountLoginTime(userName, time) {
  const tempTimeStorageNow = time.split(/[-: ]/);
  const [hour, minute] = [tempTimeStorageNow[3], tempTimeStorageNow[4]];

  let timeNow = hour * 60 + minute;

  const accountLoginDetail =
    await bankingAuthRepository.getLoginDetail(userName);

  let tempVariable = time;
  if (accountLoginDetail != null) {
    tempVariable = accountLoginDetail.time;
  }

  const tempTimeStorageDB = tempVariable.split(/[-: ]/);
  const [DBhour, DBminute] = [tempTimeStorageNow[3], tempTimeStorageDB[4]];

  const timeDB = DBhour * 60 + DBminute;

  //if time right now is like 1 am and the time in db is 23 pm it will give the time right now the correct total minutes
  if (timeNow < timeDB) {
    timeNow = timeNow + 24 * 60;
  }

  if (timeNow - timeDB > 30) {
    await bankingAuthRepository.updateAccountloginDetail(
      userName,
      'not login in',
      time,
      0,
      0
    );
  }
}

module.exports = {
  checkAccountLoginCredentials,
  checkAccountLoginAttempt,
  checkAccountLoginTime,
};
