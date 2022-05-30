import winston from "winston";
import { logLevel } from "./vars.js";

const colorizeOnlyIfDev = process.env.NODE_ENV === "development";

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.prettyPrint({ depth: 5, colorize: colorizeOnlyIfDev }),
  transports: [new winston.transports.Console()],
});

export default logger;
