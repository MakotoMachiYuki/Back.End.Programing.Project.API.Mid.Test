const authenticationServices = require('./authentication-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const { P } = require('pino');

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */

async function login(request, response, next) {
  const { email, password } = request.body;

  const timeRightNow = new Date();

  const yearS = timeRightNow.getYear().toString().split(1);
  const year = parseInt(yearS[1]);
  const month = timeRightNow.getMonth();
  const date = timeRightNow.getDate();
  const hour = timeRightNow.getHours();
  const minutes = timeRightNow.getMinutes();
  const seconds = timeRightNow.getSeconds();
  const time = `[20${year}-${month}-${date} ${hour}:${minutes}:${seconds}]`;

  try {
    // Check login credentials
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password,
      time
    );

    if (loginSuccess == 'PasswordWrong') {
      await authenticationServices.checkLoginTime(email, time);
      const attemptDetail = await authenticationServices.checkLoginAttempt(
        email,
        time
      );

      if (attemptDetail[0] == 'InvalidTry') {
        throw errorResponder(
          errorTypes.INVALID_PASSWORD,
          `${time} User ${email} failed to login!. Attempt =  ${attemptDetail[1]}`
        );
      }
      if (attemptDetail[0] == 'LimitReached') {
        throw errorResponder(
          errorTypes.INVALID_PASSWORD,
          `Limit Reached! Time left until you can try it again :) in ${attemptDetail[1]} minutes!`
        );
      }

      if (attemptDetail == 'AttemptReset') {
        throw (
          (errorResponder(errorTypes.INVALID_PASSWORD),
          'Your attempts are reseted! goodluck!')
        );
      }
    }

    if (loginSuccess == 'NoUser') {
      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Invalid Email! Check your email again!'
      );
    }

    return response.status(200).json(loginSuccess);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
