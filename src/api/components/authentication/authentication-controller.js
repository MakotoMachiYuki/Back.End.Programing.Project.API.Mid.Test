const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */

var loginAttempts = 0;
var maxAttempts = 5;
var accountLocked = false;
var lockedTimer = null;
var timeLimit = 30; // in minutes
async function login(request, response, next) {
  const { email, password } = request.body;

  try {
    if (accountLocked && Date.now() < lockedTimer) {
      loginAttempts = 0;
      const timeLeft = Math.ceil((lockedTimer - Date.now()) / (1000 * 60));
      return response.status(403).json({
        error: `Too Many Login Attempts! ${timeLeft} minutes left until you can try it again :)`,
      });
    }

    if (loginAttempts >= maxAttempts) {
      accountLocked = true;
      lockedTimer = Date.now() + 1000 * 60 * timeLimit;

      return response.status(403).json({
        error:
          'Attempts Limit Reached! Now account lock down for 30 minutes! :)',
      });
    }

    // Check login credentials
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    if (!loginSuccess) {
      loginAttempts += 1;
      return response.status(403).json({
        error: `Invalid email or password!. Please try again! Attempts: ${loginAttempts}`,
      });
    }

    loginAttempts = 0;
    return response.status(200).json(loginSuccess);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
