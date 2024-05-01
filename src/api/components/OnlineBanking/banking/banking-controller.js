const accountService = require('./banking-service');
const { errorResponder, errorTypes } = require('../../../../core/errors');

async function getAccounts(request, response, next) {
  const page_number = parseInt(request.query.page_number) || null;
  const page_size = parseInt(request.query.page_size) || null;
  const search = request.query.search;
  const sort = request.query.sort;
  try {
    const accounts = await accountService.getAccounts(
      page_number,
      page_size,
      search,
      sort
    );

    if (accounts === 'NoSearchValue') {
      throw errorResponder(
        errorTypes.NOT_FOUND,
        'NO USERS FOUND IN THE DATABASE!',
        'Required search query on the parameter!'
      );
    }

    if (accounts === 'PageBeyond') {
      throw errorResponder(
        errorTypes.PAGE_NUMBER_SIZE,
        'Page Number beyond the available pages'
      );
    }

    return response.status(200).json(accounts);
  } catch (error) {
    return next(error);
  }
}

async function createAccount(request, response, next) {
  try {
    const name = request.body.name;
    const userName = request.body.userName;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;
    const address = request.body.address;
    const city = request.body.address;
    const phoneNumber = request.body.phoneNumber;

    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    const userNameIsRegistered =
      await accountService.userNameIsRegistered(userName);
    if (userNameIsRegistered) {
      throw errorResponder(
        errorTypes.USERNAME_ALREADY_TAKEN,
        'UserName is already registered'
      );
    }
    const emailIsRegistered = await accountService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await accountService.createAccount(
      name,
      userName,
      email,
      password,
      address,
      city,
      phoneNumber
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create account'
      );
    }

    const balance = 0;
    return response
      .status(200)
      .json({ name, userName, email, address, city, phoneNumber, balance });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAccounts,
  createAccount,
};
