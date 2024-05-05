const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password, time) {
  const user = await authenticationRepository.getUserByEmail(email);

  // We define default user password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the user login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);

  // Because we always check the password (see above comment), we define the
  // login attempt as successful when the `user` is found (by email) and
  // the password matches.

  if (user && passwordChecked) {
    const loginTime = time;
    const status = 'login success';
    const attempt = 0;
    const lockedTimer = 0;

    //to check if user has ever login or not before
    const checkEmail = await authenticationRepository.getLoginDetail(email);
    if (checkEmail == null) {
      await authenticationRepository.createLoginDetail(
        email,
        status,
        loginTime,
        lockedTimer,
        attempt
      );
    } else {
      //to check if the account is locked or not, if it is,
      //then it'll return PasswordWrong in order to not let user login
      //even tho they give the correct password but their account already got locked
      const checkStatus = checkEmail.status;
      if (checkStatus === 'locked') {
        return 'PasswordWrong';
      }
      await authenticationRepository.updateLoginDetail(
        email,
        status,
        loginTime,
        lockedTimer,
        attempt
      );
    }

    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
    };
  }

  if (!user) {
    return 'NoUser';
  }

  return 'PasswordWrong';
}

/**
 * Function that will check the attempts, the time, resetting it
 * @param {String} email
 * @param {String} time
 * @returns {object}
 */
async function checkLoginAttempt(email, time) {
  let status = 'login failed';
  const attemptLimit = 5;
  const timeLimit = 30; //30 minutes

  //to  check if user has ever login or not before
  const checkEmail = await authenticationRepository.getLoginDetail(email);
  if (checkEmail == null) {
    await authenticationRepository.createLoginDetail(email, status, time, 0, 0);
  } else {
    await authenticationRepository.updateLoginDetail(email, status, time);
  }

  const userLoginDetail = await authenticationRepository.getLoginDetail(email);
  //everytime user input the wrong password, the total attempt from the database will be plus one
  const tempAttempt = parseInt(userLoginDetail.attempt) + 1;

  if (
    tempAttempt <= attemptLimit &&
    userLoginDetail.lockedTimer === 0 &&
    userLoginDetail.status !== 'locked'
  ) {
    await authenticationRepository.updateLoginDetail(
      email,
      status,
      time,
      0,
      tempAttempt
    );

    return ['InvalidTry', tempAttempt];
  }
  //when the attempt is beyond the limit it will locked the account and record the time when it can be unlocked
  if (tempAttempt > attemptLimit) {
    if (userLoginDetail.lockedTimer === 0) {
      const tempStatus = 'locked';
      const newlockedTimer = Date.now() + 60000 * timeLimit;
      await authenticationRepository.updateLoginDetail(
        email,
        tempStatus,
        time,
        newlockedTimer,
        tempAttempt
      );
      return ['LimitReached', timeLimit];
    }
    //it will give user timer update respone per minutes
    if (userLoginDetail.lockedTimer !== 0) {
      if (Date.now() <= userLoginDetail.lockedTimer) {
        const lockedTimer = userLoginDetail.lockedTimer;
        const tempStatus = 'locked';
        const timeLeft = Math.ceil(
          (userLoginDetail.lockedTimer - Date.now()) / 60000
        );
        await authenticationRepository.updateLoginDetail(
          email,
          tempStatus,
          time,
          lockedTimer,
          tempAttempt
        );

        return ['LimitReached', timeLeft];
      }
      //when the time right now is already past the lockedTimer, it will unlocked the acc and reset the login attempts
      if (Date.now() > userLoginDetail.lockedTimer) {
        const tempstatus = 'unlocked';
        await authenticationRepository.updateLoginDetail(
          email,
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
 * function that will check if the user has an attempted try to login or not, and check the time
 * if it's already beyond 30 minutes, then it'll reset the attempts
 * @param {String} email
 * @param {String} time
 */
async function checkLoginTime(email, time) {
  const tempTimeStorageNow = time.split(/[-: ]/);
  const [hour, minute] = [tempTimeStorageNow[3], tempTimeStorageNow[4]];

  let timeNow = hour * 60 + minute;

  const userLoginDetail = await authenticationRepository.getLoginDetail(email);

  //if the user fail to login for the first time
  let tempVariable = time;
  if (userLoginDetail != null) {
    tempVariable = userLoginDetail.time;
  }

  const tempTimeStorageDB = tempVariable.split(/[-: ]/);
  const [DBhour, DBminute] = [tempTimeStorageNow[3], tempTimeStorageDB[4]];

  const timeDB = DBhour * 60 + DBminute;

  //if time right now is like 1 am and the time in db is 23 pm it will give the time right now the correct total minutes
  if (timeNow < timeDB) {
    timeNow = timeNow + 24 * 60;
  }

  if (timeNow - timeDB > 30) {
    await authenticationRepository.updateLoginDetail(
      email,
      'not login in',
      time,
      0,
      0
    );
  }
}

module.exports = {
  checkLoginCredentials,
  checkLoginAttempt,
  checkLoginTime,
};
