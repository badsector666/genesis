import { createLogger, format, transports } from "winston";

import { GENERAL_CONFIG } from "configs/general.config";


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

let loggerLevel = "info";
if (GENERAL_CONFIG.verbose) {
    loggerLevel = "silly";
}

const logger = createLogger({
    format: loggerFormat,
    transports: [
        new transports.Console({ level: loggerLevel })
    ],
});


export default logger;