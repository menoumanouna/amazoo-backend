import winston from "winston";
// Define the logger configuration
export const logger = winston.createLogger({
    level: 'info', // Set the minimum log level
    format: winston.format.combine(
        winston.format.timestamp(), // Add timestamp to logs
        winston.format.simple() // Simple formatting
    ),
    transports: [
        new winston.transports.Console(), // Log to the console
        new winston.transports.File({ filename: 'error.log', level: 'error' }) // Log errors to a file
    ]
});

