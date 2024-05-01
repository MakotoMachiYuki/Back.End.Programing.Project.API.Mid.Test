const joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = joi.extend(joiPasswordExtendCore);

module.exports = {
  createAccount: {
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
};
