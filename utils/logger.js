const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ level, message, timestamp }) => {
      return `${timestamp} ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    // Log errors to error.log
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Log successes (info level) to success.log
    new transports.File({ filename: 'logs/success.log', level: 'info' }),
    // Log all levels to the console
    new transports.Console({
      format: format.combine(
        format.colorize(), // Add colors to the console output
        format.printf(({ level, message, timestamp }) => {
          return `${timestamp} ${level}: ${message}`;
        })
      ),
    }),
  ],
});

// Separate 'info' and 'error' level logs
logger.add(new transports.File({ filename: 'logs/error.log', level: 'error' }));
logger.add(new transports.File({ filename: 'logs/success.log', level: 'info' }));

module.exports = logger;
