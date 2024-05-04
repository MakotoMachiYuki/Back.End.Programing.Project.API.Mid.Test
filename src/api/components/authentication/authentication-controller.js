const authenticationServices = require('./authentication-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */

async function login(request, response, next) {
  const { email, password } = request.body;

  //initialize all the variables for recording the time right now
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
      //when the attempts are below the limit attempt it will return the attempt count
      if (attemptDetail[0] == 'InvalidTry') {
        throw errorResponder(
          errorTypes.INVALID_PASSWORD,
          `${time} User ${email} failed to login!. Attempt =  ${attemptDetail[1]}`
        );
      }
      //when the attempts reach the limit, it will return the minute left until the the user could try it again
      if (attemptDetail[0] == 'LimitReached') {
        throw errorResponder(
          errorTypes.INVALID_PASSWORD,
          `Limit Reached! Time left until you can try it again :) in ${attemptDetail[1]} minutes!`
        );
      }
      //when the timer is finished, it'll send respone that your attempts has been reseted!
      if (attemptDetail == 'AttemptReset') {
        throw errorResponder(
          errorTypes.UNPROCESSABLE_ENTITY,
          'Your attempts are reseted! goodluck!'
        );
      }
    }
    //if there's no email recorded in the user database, it'll return message no invalid email
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
