const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Get list of users
 * @param {integer} page_number
 * @param {integer} page_size
 * @param {integer} offset
 * @returns {Array}
 */
async function getUsers(number, size, search, sort) {
  const [page_number, page_size] = await checkPage(number, size);

  const firstOfData = (page_number - 1) * page_size;
  const endOfData = page_number * page_size;

  const searchByName = search.split('=');
  const [searchPath, searchName] =
    searchByName.length > 1 ? searchByName[1].split(':') : [];

  const users = await usersRepository.getUsersLimit(page_size, firstOfData);
  const usersAll = await usersRepository.getUsers();

  const count = usersAll.length;
  const total_pages = Math.ceil(count / page_size);
  const has_previous_page = await previous_page(firstOfData);
  const has_next_page = await next_page(endOfData, count);

  const results = {
    page_number: page_number,
    page_size: page_size,
    count: count,
    total_pages: total_pages,
    has_previous_page: has_previous_page,
    has_next_page: has_next_page,
    data: [],
  };

  const tempData = [];
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    tempData.push({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  if (searchPath === 'email') {
    for (let i = 0; i < users.length; i++) {
      if (tempData[i].email.includes(searchName)) {
        const user = tempData[i];
        results.data.push({
          id: user.id,
          name: user.name,
          email: user.email,
        });
      }
    }
  }
  if (searchPath === 'name') {
    for (let i = 0; i < users.length; i++) {
      if (tempData[i].name.includes(searchName)) {
        const user = tempData[i];
        results.data.push({
          id: user.id,
          name: user.name,
          email: user.email,
        });
      }
    }
  }
  return results;
}

/**
 * check if page_number or page_size or both are null so that it could be inserted default values
 * @param {Integer} number - page_number
 * @param {Integer} size  - page_size
 * @returns {Integer}
 */
async function checkPage(number, size) {
  const users = await usersRepository.getUsers();
  if (number === undefined || size === undefined) {
    number = 1;
    size = users.length;
    return [number, size];
  } else {
    return [number, size];
  }
}
/**
 * Return true or false if there is previous page or not
 * @param {Number} firstOfData - first index of data to be push
 * @returns {Boolean}
 */
async function previous_page(firstOfData) {
  if (firstOfData > 0) {
    return true;
  } else {
    return false;
  }
}
/**
 * Return true or false if there is next page or not
 * @param {Number} endOfData - last index of data to be push
 * @param {Integer} count - total users data
 * @returns {Boolean}
 */
async function next_page(endOfData, count) {
  if (endOfData + 1 < count) {
    return true;
  } else {
    return false;
  }
}

async function checkSort(sort) {
  if (sort === 'desc') {
    return -1;
  } else {
    return 1;
  }
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
};
