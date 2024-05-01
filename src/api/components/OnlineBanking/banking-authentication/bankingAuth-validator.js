const joi = require('joi');

module.exports = {
  login: {
    body: {
      userName: joi.string().required().label('UserName'),
      password: joi.string().required().label('Password'),
    },
  },
};
