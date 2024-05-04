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
        'NO USERS FOUNDED IN THE DATABASE!',
        'Required search query on the parameter!'
      );
    }
    if (accounts === 'NoUserWithRequestSearch') {
      throw errorResponder(
        errorTypes.NOT_FOUND,
        'NO USERS WITH REQUEST SEARCH FOUNDED IN THE DATABASE!'
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
    const city = request.body.city;
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
        'UserName is already registered, must be unique!'
      );
    }
    const emailIsRegistered = await accountService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }
    const phoneNumberIsRegistered =
      await accountService.phoneNumberIsRegistered(phoneNumber);
    if (phoneNumberIsRegistered) {
      throw errorResponder(
        errorTypes.PHONENUMBER_ALREADY_TAKEN,
        'Phone Number is already registered'
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

async function getAccount(request, response, next) {
  try {
    const account = await accountService.getAccount(request.params.id);
    if (!account) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown Account');
    }
    return response.status(200).json(account);
  } catch (error) {
    return next(error);
  }
}

async function deleteAccount(request, response, next) {
  try {
    const id = request.params.id;

    const success = await accountService.deleteAccount(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to Delete Account!'
      );
    }

    const account = await accountService.getAccount(id);
    const userName = account.userName;
    const successMessage = `Account with ID ${id} and USERNAME: ${userName} has been successfully deleted! `;
    return response.status(200).json({ successMessage });
  } catch (error) {
    return next(error);
  }
}

async function updateAccount(request, response, next) {
  const id = request.params.id;
  const name = request.body.name || null;
  const email = request.body.email || null;
  const address = request.body.address || null;
  const city = request.body.city || null;
  const phoneNumber = request.body.phoneNumber || null;

  try {
    const emailIsRegistered = await accountService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }
    const phoneNumberIsRegistered =
      await accountService.phoneNumberIsRegistered(phoneNumber);
    if (phoneNumberIsRegistered) {
      throw errorResponder(
        errorTypes.PHONENUMBER_ALREADY_TAKEN,
        'Phone Number is already registered'
      );
    }

    const updateAccount = await accountService.updateAccount(
      id,
      name,
      email,
      address,
      city,
      phoneNumber
    );

    if (updateAccount === 'NoAccount') {
      throw errorResponder(errorTypes.NOT_FOUND, 'Unknown Account');
    }
    if (!updateAccount) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update Account!'
      );
    }

    const successMessage = `Account ${id} has been successfully updated!`;
    return response.status(200).json({ successMessage });
  } catch (error) {
    return next(error);
  }
}

async function updatePassword(request, response, next) {
  const id = request.params.id;
  const password_old = request.body.password_old;
  const password_new = request.body.password_new;
  const password_confirm = request.body.password_confirm;

  try {
    const checkPassword = await accountService.checkPassword(id, password_old);
    console.log(checkPassword);
    if (!checkPassword) {
      throw errorResponder(errorTypes.INVALID_PASSWORD, 'Wrong Password!');
    }

    if (password_new !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismathced!'
      );
    }

    const successChange = await accountService.changePassword(id, password_new);
    if (!successChange) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change the password!'
      );
    }

    return response.status(200).json({ id, password_new });
  } catch (error) {
    return next(error);
  }
}

async function deposit(request, response, next) {
  const id = request.params.id;
  const moneyValue = parseFloat(request.body.deposit);

  try {
    const successDeposit = await accountService.deposit(id, moneyValue);

    if (!successDeposit) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to deposit the balance!'
      );
    }

    const old_balance = successDeposit[0];
    const new_balance = successDeposit[1];

    return response.status(200).json({ id, old_balance, new_balance });
  } catch (error) {
    return next(error);
  }
}

async function withdraw(request, response, next) {
  const id = request.params.id;
  const moneyValue = parseFloat(request.body.withdraw);

  try {
    const successWithdraw = await accountService.withdraw(id, moneyValue);

    if (!successWithdraw) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to withdraw the balance!'
      );
    }

    if (successWithdraw === 'noMoney') {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'No Money left in the account!'
      );
    }

    const old_balance = successWithdraw[0];
    const new_balance = successWithdraw[1];

    return response.status(200).json({ id, old_balance, new_balance });
  } catch (error) {
    return next(error);
  }
}

async function transfer(request, response, next) {
  const id = request.params.id;
  const target_userName = request.body.target_userName;
  const transfer_amount = parseFloat(request.body.transfer_amount);

  try {
    const successTransfer = await accountService.transfer(
      id,
      target_userName,
      transfer_amount
    );

    if (successTransfer === 'NoEnoughMoney') {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Your Balance is not enough for the transfer!'
      );
    }

    if (successTransfer === 'NoTargetAccount') {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Your target/receiver account does not exist!'
      );
    }

    const Transfer_Detail = {
      old_balance: successTransfer[0],
      new_balance: successTransfer[1],

      Receiver: target_userName,
      transfer_amount: successTransfer[2],
    };

    return response.status(200).json({ Transfer_Detail });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAccounts,
  getAccount,
  createAccount,
  deleteAccount,
  updatePassword,
  updateAccount,
  deposit,
  withdraw,
  transfer,
};
