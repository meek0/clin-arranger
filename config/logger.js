import winston from "winston";

const colorizeOnlyIfDev = process.env.NODE_ENV === "development";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info", //TODO==================== env var
  format: winston.format.prettyPrint({ depth: 5, colorize: colorizeOnlyIfDev }),
  transports: [new winston.transports.Console()],
});

export default logger;
