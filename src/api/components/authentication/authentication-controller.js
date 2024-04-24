const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */

//initialize all required variables
let loginAttempts = 0;
const maxAttempts = 5;
let accountLocked = false;
let lockedTimer = null;
const timeLimit = 30; // in minutes
async function login(request, response, next) {
  const { email, password } = request.body;

  try {
    //check if the account is locked and the time right now is below than the locked timer
    if (accountLocked && Date.now() < lockedTimer) {
      //reseting the login Attempts
      loginAttempts = 0;
      //checking how much times left
      const timeLeft = Math.ceil((lockedTimer - Date.now()) / (1000 * 60));

      return response.status(403).json({
        error: `Too Many Login Attempts! ${timeLeft} minutes left until you can try it again :)`,
      });
    }
    //if the time right now over the locked timer then the login attempts will be reseted and account will be unlocked
    if (accountLocked && Date.now() > lockedTimer) {
      //reseting the login Attempts
      loginAttempts = 0;
      accountLocked = false;
    }

    //locked the account and set the locked timer based on the time right now times the timelimit
    if (loginAttempts >= maxAttempts) {
      accountLocked = true;
      lockedTimer = Date.now() + 1000 * 60 * timeLimit;

      return response.status(403).json({
        error: `Attempts Limit Reached! Now account lock down for ${timeLimit} minutes! :)`,
      });
    }

    // Check login credentials
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    if (!loginSuccess) {
      //every fail login will result loginAttempts plus 1
      loginAttempts += 1;

      return response.status(403).json({
        error: `Invalid email or password!. Please try again! Attempts: ${loginAttempts}`,
      });
    }

    //successful login will rest loginAttempts back to 0
    loginAttempts = 0;
    return response.status(200).json(loginSuccess);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
