const accountsRepository = require('./banking-repository');
const { hashPassword, passwordMatched } = require('../../../../utils/password');

async function getAccounts(
  numberOfPages,
  sizeofPages,
  searchSubString,
  sortSubString
) {
  const accountsAllEveryone = await accountsRepository.getAccounts();

  const tempDataStoraGE = [];

  //if number of page is null
  if (numberOfPages == null && sizeofPages !== null) {
    const tempTotalPage = Math.ceil(accountsAllEveryone.length / sizeofPages);
    const tempResult = await printAllPage(
      tempTotalPage,
      sizeofPages,
      searchSubString,
      sortSubString
    );

    const results = [];
    for (let i = 0; i <= tempTotalPage; i++) {
      if (tempResult[i] != null) {
        results.push(tempResult[i]);
      }
    }
    return results;
  }

  if (
    (sizeofPages == null && numberOfPages == null) ||
    (sizeofPages == null && numberOfPages != null)
  ) {
    numberOfPages = 1;
    sizeofPages = accountsAllEveryone.length;
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
  const count = accountsAllEveryone.length;
  const total_pages = Math.ceil(count / page_size);
  const has_previous_page = await previous_page(firstOfData);
  const has_next_page = await next_page(endOfData, count);

  //get the users which is filtered by page number and page size + sort them too
  const filteredAccountArray =
    await accountsRepository.getAccountByFilteringAndSorting(
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

  for (let MACHI = 0; MACHI < filteredAccountArray.length; MACHI++) {
    const tempAccountData = filteredAccountArray[MACHI];
    tempDataStoraGE.push({
      id: tempAccountData.id,
      name: tempAccountData.name,
      userName: tempAccountData.userName,
      email: tempAccountData.email,
      address: tempAccountData.address,
      city: tempAccountData.city,
      phoneNumber: tempAccountData.phoneNumber,
      balance: tempAccountData.balance,
    });
  }

  //filter the data by .includes() function and all lowercase by the given searchPath and searchName
  let MACHI = 0;
  while (MACHI < filteredAccountArray.length) {
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
          userName: filterData.userName,
          email: filterData.email,
          address: filterData.address,
          city: filterData.city,
          phoneNumber: filterData.phoneNumber,
          balance: filterData.balance,
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
          userName: filterData.userName,
          email: filterData.email,
          address: filterData.address,
          city: filterData.city,
          phoneNumber: filterData.phoneNumber,
          balance: filterData.balance,
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

/**
 * Return true or false if there is next page or not
 * @param {Number} endOfData - last index of data to be push
 * @param {Number} count - total users data
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
 * return all pages available from the database if the number of page isn't filled but page size is
 * @param {Number} total_pages
 * @param {Number} sizeofPages
 * @param {String} searchSubString
 * @param {String} sortSubString
 * @returns {Array}
 */
async function printAllPage(
  total_pages,
  sizeofPages,
  searchSubString,
  sortSubString
) {
  const testTemp = [];

  for (let i = 1; i <= total_pages; i++) {
    testTemp[i] = await getAccounts(
      i,
      sizeofPages,
      searchSubString,
      sortSubString
    );
  }

  return testTemp;
}

async function createAccount(
  name,
  userName,
  email,
  password,
  address,
  city,
  phoneNumber
) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    const balance = 0;
    await accountsRepository.createAccount(
      name,
      userName,
      email,
      hashedPassword,
      address,
      city,
      phoneNumber,
      balance
    );
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
  const account = await accountsRepository.getAccountByEmail(email);

  if (account) {
    return true;
  }

  return false;
}

/**
 * Check whether the userName is registered
 * @param {string} userName - userName
 * @returns {boolean}
 */
async function userNameIsRegistered(userName) {
  const account = await accountsRepository.getAccountByUserName(userName);

  if (account) {
    return true;
  }

  return false;
}

module.exports = {
  getAccounts,
  createAccount,
  emailIsRegistered,
  userNameIsRegistered,
};
