const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const { sortedLastIndexOf } = require('lodash');

/**
 * Get list of users
 * @param {integer} page_number
 * @param {integer} page_size
 * @param {integer} offset
 * @returns {Array}
 */
async function getUsers(numberOfPages, sizeofPages, search, sort) {
  //get all users in the database
  const usersAllEveryone = await usersRepository.getUsers();
  const tempDataStoraGE = [];

  let tempNumber = numberOfPages;
  let tempSize = sizeofPages;

  const [page_number, page_size] = [tempNumber, tempSize];
  const firstOfData = (page_number - 1) * page_size;
  const endOfData = page_number * page_size;

  console.log(tempNumber, tempSize);

  //assigning searchPath (email/name) and searchName variable
  if (search == null) {
    return 'NoSearchValue';
  }
  const searchByName = search.split('=');
  const [searchPath, searchName] = searchByName[0].split(':');

  //assigning sorting (email(default)/name)
  if (sort == null) {
    sort = 'sort=email:asc';
  }
  let sortByName = sort.split('=');
  let [sortPath, tempsortValue] = sortByName[0].split(':');
  let sortValue = 1;
  if (tempsortValue === 'desc') {
    sortValue = -1;
  }

  console.log(sortByName);
  console.log(`sortPath = ${sortPath} && SortValue = ${sortValue} `);

  //get the users which is filtered by page number and page size + sort them too
  const filteredUsersArray = await usersRepository.getUserByFilteringAndSorting(
    page_size,
    firstOfData,
    sortPath,
    sortValue
  );

  const count = usersAllEveryone.length;
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

  for (let MACHI = 0; MACHI < filteredUsersArray.length; MACHI++) {
    const tempUserData = filteredUsersArray[MACHI];
    tempDataStoraGE.push({
      id: tempUserData.id,
      name: tempUserData.name,
      email: tempUserData.email,
    });
  }

  for (let MACHI = 0; MACHI < filteredUsersArray.length; MACHI++) {
    if (searchPath === 'email') {
      if (tempDataStoraGE[MACHI].email.includes(searchName)) {
        const filterData = tempDataStoraGE[MACHI];
        results.data.push({
          id: filterData.id,
          name: filterData.name,
          email: filterData.email,
        });
      }
    } else if (searchPath === 'name') {
      if (tempDataStoraGE[MACHI].name.includes(searchName)) {
        const filterData = tempDataStoraGE[MACHI];
        results.data.push({
          id: filterData.id,
          name: filterData.name,
          email: filterData.email,
        });
      }
    }
  }
  return results;
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