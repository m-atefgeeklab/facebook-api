const mongoose = require('mongoose');
const logger = require('../utils/logger');

const dbConnection = () => {
  mongoose
    .connect('mongodb://127.0.0.1/facebook-scraping')
    .then((conn) => {
      logger.info(`MongoDB Connected on host: ${conn.connection.host}`);
    })
    .catch((err) => {
      logger.error(`Database Error: ${err}`);
      process.exit(1);
    });
};

module.exports = dbConnection;
