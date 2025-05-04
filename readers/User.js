const _property = require("lodash/property");

const READER = {
  username: _property("username"),
  email: _property("email"),
  phoneNumber: _property("phoneNumber"),
};

module.exports = READER;
