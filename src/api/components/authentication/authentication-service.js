const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');
const { P } = require('pino');

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
    const status = 'login success';
    const attempt = 0;
    const lockedTimer = 0;

    const checkEmail = await authenticationRepository.getLoginDetail(email);
    if (checkEmail == null) {
      await authenticationRepository.createLoginDetail(
        email,
        status,
        time,
        lockedTimer,
        attempt
      );
    } else {
      await authenticationRepository.updateLoginDetail(
        email,
        status,
        time,
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

async function checkLoginAttempt(email, time) {
  let status = 'login failed';
  const attemptLimit = 2;
  const timeLimit = 2;

  const checkEmail = await authenticationRepository.getLoginDetail(email);
  if (checkEmail == null) {
    await authenticationRepository.createLoginDetail(email, status, time, 0, 0);
  } else {
    await authenticationRepository.updateLoginDetail(email, status, time);
  }

  const userLoginDetail = await authenticationRepository.getLoginDetail(email);
  const tempAttempt = parseInt(userLoginDetail.attempt) + 1;

  if (tempAttempt <= attemptLimit && userLoginDetail.lockedTimer === 0) {
    await authenticationRepository.updateLoginDetail(
      email,
      status,
      time,
      0,
      tempAttempt
    );

    return ['InvalidTry', tempAttempt];
  }
  if (tempAttempt > attemptLimit) {
    if (userLoginDetail.lockedTimer === 0) {
      const tempStatus = 'locked';
      const newlockedTimer = Date.now() + 1000 * 60 * timeLimit;
      await authenticationRepository.updateLoginDetail(
        email,
        tempStatus,
        time,
        newlockedTimer,
        tempAttempt
      );
      return ['LimitReached', timeLimit];
    }
    if (userLoginDetail.lockedTimer !== 0) {
      if (Date.now() <= userLoginDetail.lockedTimer) {
        const lockedTimer = userLoginDetail.lockedTimer;
        const tempStatus = 'locked';
        const timeLeft = Math.ceil(
          (userLoginDetail.lockedTimer - Date.now()) / (1000 * 60)
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

async function checkLoginTime(email, time) {
  const tempTimeStorageNow = time.split(/[-: ]/);
  const [hour, minute] = [tempTimeStorageNow[3], tempTimeStorageNow[4]];

  let timeNow = hour * 60 + minute;

  const userLoginDetail = await authenticationRepository.getLoginDetail(email);
  const tempVariable = userLoginDetail.time;
  const tempTimeStorageDB = tempVariable.split(/[-: ]/);
  const [DBhour, DBminute] = [tempTimeStorageNow[3], tempTimeStorageDB[4]];

  const timeDB = DBhour * 60 + DBminute;

  if (timeNow < timeDB) {
    timeNow = timeNow + 24 * 60;
  }

  if (timeNow - timeDB > 2) {
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
