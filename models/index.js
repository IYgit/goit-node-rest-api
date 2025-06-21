'use strict';

const sequelize = require('../db/sequelize'); // Use the existing sequelize instance
const User = require('./user');
const Contact = require('./contact').default; // Handle ES module default export

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
