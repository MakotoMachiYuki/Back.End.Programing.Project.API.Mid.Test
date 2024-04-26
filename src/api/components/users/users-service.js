const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Get list of users and returns with pagination
 * @param {Integer} numberOfPages - page_number
 * @param {Integer} sizeofPages - page_size
 * @param {Integer} searchSubString - search
 * @param {Integer} sortSubString - sort
 * @returns {Array}
 */
async function getUsers(
  numberOfPages,
  sizeofPages,
  searchSubString,
  sortSubString
) {
  //get all users in the database
  const usersAllEveryone = await usersRepository.getUsers();

  //initialize temporary array that will be used later
  const tempDataStoraGE = [];

  //if number of page is null
  if (numberOfPages == null && sizeofPages !== null) {
    const tempTotalPage = Math.ceil(usersAllEveryone.length / sizeofPages);
    const tempResult = await printAllPage(
      tempTotalPage,
      sizeofPages,
      searchSubString,
      sortSubString
    );

    const result = [];
    for (let i = 0; i <= tempTotalPage; i++) {
      if (tempResult[i] != null) {
        result.push(tempResult[i]);
      }
    }
    return result;
  }

  if (
    (sizeofPages == null && numberOfPages == null) ||
    (sizeofPages == null && numberOfPages != null)
  ) {
    numberOfPages = 1;
    sizeofPages = usersAllEveryone.length;
  }

  //initialize the page_number and page_size variable
  const [page_number, page_size] = [numberOfPages, sizeofPages];

  //initialize the first index of the data
  const firstOfData = (page_number - 1) * page_size;
  //initialize the last index of the data
  const endOfData = page_number * page_size;

  //if the search is empty, it'll return no data error
  if (searchSubString == null) {
    return 'NoSearchValue';
  }
  //assigning searchPath (email/name) and searchName variable
  const searchByName = searchSubString.split('=');
  const [searchPath, searchName] = searchByName[0].split(':');
  //if the search format is wrong  it'll return no data error
  if (searchName === '') {
    return 'NoSearchValue';
  }

  //assigning sorting (email(default)/name)
  if (sortSubString == null) {
    sortSubString = '=email:asc';
  }
  const sortByName = sortSubString.split('=');
  const [sortPath, tempsortValue] = sortByName[0].split(':');

  //the default ascending is 1 and descending is -1 for mongoose .sort() function
  let sortValue = 1;
  if (tempsortValue === 'desc') {
    sortValue = -1;
  }

  //asssigning specific values to all the variables below
  const count = usersAllEveryone.length;
  const total_pages = Math.ceil(count / page_size);
  const has_previous_page = await previous_page(firstOfData);
  const has_next_page = await next_page(endOfData, count);

  //get the users which is filtered by page number and page size + sort them too
  const filteredUsersArray = await usersRepository.getUserByFilteringAndSorting(
    page_size,
    firstOfData,
    sortPath,
    sortValue
  );

  if (page_number > total_pages) {
    return 'PageBeyond';
  }

  //initialize the pagination
  const paginationOfAllTheData = {
    page_number: page_number,
    page_size: page_size,
    count: count,
    total_pages: total_pages,
    has_previous_page: has_previous_page,
    has_next_page: has_next_page,
    data: [],
  };

  //inputting the data to the temporary array storage
  for (let MACHI = 0; MACHI < filteredUsersArray.length; MACHI++) {
    const tempUserData = filteredUsersArray[MACHI];
    tempDataStoraGE.push({
      id: tempUserData.id,
      name: tempUserData.name,
      email: tempUserData.email,
    });
  }

  //filter the data by .includes() function and all lowercase by the given searchPath and searchName
  let MACHI = 0;
  while (MACHI < filteredUsersArray.length) {
    if (searchPath === 'email') {
      if (
        tempDataStoraGE[MACHI].email
          .toLowerCase()
          .includes(searchName.toLowerCase())
      ) {
        const filterData = tempDataStoraGE[MACHI];
        paginationOfAllTheData.data.push({
          id: filterData.id,
          name: filterData.name,
          email: filterData.email,
        });
      }
    } else if (searchPath === 'name') {
      if (
        tempDataStoraGE[MACHI].name
          .toLowerCase()
          .includes(searchName.toLowerCase())
      ) {
        const filterData = tempDataStoraGE[MACHI];
        paginationOfAllTheData.data.push({
          id: filterData.id,
          name: filterData.name,
          email: filterData.email,
        });
      }
    }
    MACHI += 1;
  }

  return paginationOfAllTheData;
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

async function printAllPage(
  total_pages,
  sizeofPages,
  searchSubString,
  sortSubString
) {
  const testTemp = [];

  for (let i = 1; i <= total_pages; i++) {
    testTemp[i] = await getUsers(
      i,
      sizeofPages,
      searchSubString,
      sortSubString
    );
  }

  return testTemp;
}

/**
 * Return true or false if there is next page or not
 * @param {Number} endOfData - last index of data to be push
 * @param {Integer} count - total users data
 * @returns {Boolean}
 */
async function next_page(endOfData, count) {
  if (endOfData <= count) {
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
