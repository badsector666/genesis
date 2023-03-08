import { createLogger, format, transports } from "winston";

import { GENERAL_CONFIG } from "configs/global.config";


/**
 * Logger format.
 */
const loggerFormat = format.combine(
    format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss"
    }),
    format.printf((info) => {
        return `[${info.timestamp}] [${info.level.toUpperCase()}] ${
            info.message
        }`;
    }),
    format.colorize({
        all: true,
    })
);

/**
 * Logger level.
 */
let loggerLevel = "info";
if (GENERAL_CONFIG.verbose) {
    loggerLevel = "silly";
}

/**
 * Winston debug filter.
 */
const debugFilter = format((info, ) => {
    if (info.level === "debug") {
        return info;
    }
    return false;
});

/**
 * Winston general formatted logger.
 */
const logger = createLogger({
    format: loggerFormat,
    transports: [
        new transports.Console({ level: loggerLevel }),
        new transports.File({
            filename: "logs/errors.log",
            level: "error",
            format: format.combine(format.uncolorize(), format.json())
        }),
        new transports.File({
            filename: "logs/debugs.log",
            level: "debug",
            format: format.combine(format.uncolorize(), format.json(), debugFilter())
        })
    ],
});


export default logger;