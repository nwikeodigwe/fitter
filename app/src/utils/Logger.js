const winston = require("winston");
require("express-async-errors");

class Logger {
  constructor() {
    const format = winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.json(),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    );
    const transports = [
      new winston.transports.File({ filename: "logs/info.log" }),
    ];

    if (process.env.NODE_ENV === "debug")
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), format),
        })
      );

    this.logger = winston.createLogger({
      level: "debug",
      format,
      transports,
      exceptionHandlers: [
        new winston.transports.File({
          filename: "logs/exceptions.log",
        }),
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize()),
        }),
      ],
      exitOnError: false,
    });
  }

  info(message, ...args) {
    this.logger.info(message, ...args);
  }

  error(message, ...args) {
    this.logger.error(message, ...args);
  }

  warn(message, ...args) {
    this.logger.warn(message, ...args);
  }

  debug(message, ...args) {
    this.logger.debug(message, ...args);
  }
}

module.exports = new Logger();
