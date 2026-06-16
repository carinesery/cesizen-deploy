import fs from "fs";
import path from "path";

const logsDir = "./logs";

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const securityLogPath = path.join(logsDir, "security.log");
const errorLogPath = path.join(logsDir, "error.log");

const writeLog = (
    filePath: string,
    level: string,
    event: string,
    message: string
) => {
    const timestamp = new Date().toISOString();

    const logEntry =
        `${timestamp} | ${level} | ${event} | ${message}\n`;

    fs.appendFileSync(filePath, logEntry);
};

export const logger = {
    security: (event: string, message: string) => {
        writeLog(
            securityLogPath,
            "SECURITY",
            event,
            message
        );
    },

    error: (message: string) => {
        writeLog(
            errorLogPath,
            "ERROR",
            "APPLICATION_ERROR",
            message
        );
    },
};