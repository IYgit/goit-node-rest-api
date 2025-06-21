'use strict';
const dotenv = require('dotenv');
const path = require('path');

const environment = process.env.NODE_ENV || 'development';
// Adjust path to be relative to project root, assuming .env files are there
dotenv.config({ path: path.resolve(process.cwd(), `.env.${environment}`) });

const commonConfig = {
  username: process.env.DATABASE_USERNAME || 'default_user', // Debug default
  password: process.env.DATABASE_PASSWORD || 'default_password', // Debug default
  host: process.env.DATABASE_HOST || 'localhost', // Debug default
  dialect: process.env.DATABASE_DIALECT || 'postgres', // Default to postgres if not set
  dialectOptions: {
    ssl: process.env.DATABASE_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false
  },
  logging: environment === 'development' ? console.log : false, // Log queries in dev
};

const config = {
  development: {
    ...commonConfig,
    database: process.env.DATABASE_NAME,
  },
  test: {
    ...commonConfig,
    database: process.env.DATABASE_NAME_TEST || `${process.env.DATABASE_NAME}_test`,
    logging: false, // Usually disable logging for tests
  },
  production: {
    ...commonConfig,
    database: process.env.DATABASE_NAME,
    logging: false, // Disable logging in production unless specifically needed
  }
};

module.exports = config; // Export the config object that sequelize-cli expects