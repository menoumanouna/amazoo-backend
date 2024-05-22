/**
 * @extends Error
 */
export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

/**
 * @extends Error
 */
class ExtendableError extends Error {
    constructor(code, type, message, data, isPublic) {
        super(code, type, message, data);
        this.name = this.constructor.name;
        this.message = message;
        this.code = code;
        this.type = type;
        this.data = data || null;
        this.isPublic = isPublic;
        this.isOperational = true;
        Error.captureStackTrace(this);
    }
}

/**
 * Class representing an API error.
 *
 * @extends ExtendableError
 */
class APIError extends ExtendableError {
    /**
     * Creates an API error.
     *
     * @param {Number} code - HTTP status code of error.
     * @param {String} type - Error type.
     * @param {String} message - Error message.
     * @param {Array} data - Error data.
     * @param {Boolean} isPublic - Whether the message should be visible to user or not.
     */
    constructor(code, type, message, data, isPublic = false) {
        super(code, type, message, data);
    }
}

/**
 * Class for required error
 *
 * @class RequiredError
 */
export class RequiredError {
    /**
     * Make error pretty
     *
     * @static
     * @param {Array} errors - Array of error Object
     * @returns {Object} - errors - Pretty Object transform
     */
    static makePretty(errors) {
        return errors.reduce((obj, error) => {
            const nObj = obj;
            nObj[error.field] = error.messages
                ? error.messages[0].replace(/"/g, '')
                : error.message;
            return nObj;
        }, {});
    }
}

export default APIError;
