const mongoose = require("mongoose");
const logger = require("../utils/logger");

const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_DB_URI)
    .then((conn) => {
      logger.info(`MongoDB Connected on host: ${conn.connection.host}`);
    })
    .catch((err) => {
      logger.error(`Database Error: ${err}`);
      process.exit(1);
    });
};

module.exports = dbConnection;
