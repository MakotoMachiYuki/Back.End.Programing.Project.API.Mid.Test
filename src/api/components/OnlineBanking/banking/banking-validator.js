const joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = joi.extend(joiPasswordExtendCore);

module.exports = {
  createAccount: {
    query: {
      page_number: joi.number().integer().greater(0).label('Page Number'),
      page_size: joi.number().integer().greater(0).label('Page Size'),
    },
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      userName: joi
        .string()
        .alphanum()
        .min(8)
        .max(30)
        .required()
        .label('UserName'),
      email: joi.string().email().required().label('Email'),
      password: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .min(6)
        .max(32)
        .required()
        .label('Password'),
      password_confirm: joi.string().required().label('Password Confirmation'),
      address: joi.string().required().min(1).label('Addresss'),
      city: joi.string().required().min(1).label('City'),
      phoneNumber: joi
        .number()
        .integer()
        .min(10 ** 5)
        .max(10 ** 15)
        .required()
        .label('Phone Number'),
    },
  },

  updateAccount: {
    body: {
      name: joi.string().min(1).max(100).label('Name'),
      email: joi.string().email().label('Email'),
      address: joi.string().min(1).label('Addresss'),
      city: joi.string().min(1).label('City'),
      phoneNumber: joi
        .number()
        .integer()
        .min(10 ** 5)
        .max(10 ** 15)
        .label('Phone Number'),
    },
  },

  changePassword: {
    body: {
      password_old: joi.string().required().label('Old password'),
      password_new: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .min(6)
        .max(32)
        .required()
        .label('New password'),
      password_confirm: joi.string().required().label('Password confirmation'),
    },
  },
};
