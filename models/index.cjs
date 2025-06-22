'use strict';

const sequelize = require('../db/sequelize'); // Use the existing sequelize instance
const User = require('./user.cjs'); // Updated to .cjs
const Contact = require('./contact.js').default; // Assuming contact.js remains ESM .js file

const db = {
  sequelize,
  Sequelize: sequelize.Sequelize, // Expose Sequelize class
  User,
  Contact,
};

// Perform associations
if (db.User.associate) {
  db.User.associate(db);
}
if (db.Contact.associate) {
  db.Contact.associate(db);
}

module.exports = db;
