const userData = require('../models/userData.js');

const findUserData = (email) => {
  return userData.find({'email': email});
}

module.exports = { findUserData };