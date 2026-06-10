import winston from "winston";
import path from "path";

// Define log directory
const logDir = "logs";

// Custom format for logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}${
      stack ? "\n" + stack : ""
    }`;
  })
);

// Console format with colors
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
  })
);

const logger = winston.createLogger({
  level: "info",
  format: customFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
    }),

    // Error log file
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Warning log file
    new winston.transports.File({
      filename: path.join(logDir, "warn.log"),
      level: "warn",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Prevent logger from exiting on error
  exitOnError: false,
});

// Create helper methods for consistent logging
export const loggerHelper = {
  error: (message: string, meta?: any) => {
    logger.error(message, meta);
  },
  warn: (message: string, meta?: any) => {
    logger.warn(message, meta);
  },
  info: (message: string, meta?: any) => {
    logger.info(message, meta);
  },
  debug: (message: string, meta?: any) => {
    logger.debug(message, meta);
  },
  // Method for logging HTTP requests
  httpLogger: (req: any, res: any, next: any) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      logger.info(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
      );
    });
    next();
  },
};

// Handling uncaught exceptions
logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(logDir, "exceptions.log"),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
);

// Handling unhandled promise rejections
process.on("unhandledRejection", (error: Error) => {
  logger.error("Unhandled Promise Rejection:", error);
});

export default loggerHelper;
