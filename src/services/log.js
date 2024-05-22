/**
 * Error handler for api routes
 */

import PrettyError from 'pretty-error';
import HTTPStatus from 'http-status';

import { isCelebrateError } from 'celebrate';
import APIError, { RequiredError } from './error';

const isDev = process.env.NODE_ENV;

// eslint-disable-next-line no-unused-vars
export default function logErrorService(err, req, res, next) {
    if (!err) {
        return new APIError(
            HTTPStatus.INTERNAL_SERVER_ERROR,
            "Error",
            'Error with the server!',
        );
    }
    // Continue to celebrate error handler
    if (isCelebrateError(err)) return next(err);

    if (isDev) {
        const pe = new PrettyError();
        pe.skipNodeFiles();
        pe.skipPackage('express');

        // eslint-disable-next-line no-console
        console.log(pe.render(err));
    }

    const error = {
        code: err.code || HTTPStatus.BAD_REQUEST,
        type: err.type || 'error',
        message: err.message || 'Internal Server Error.',
        data: err.data || null,
    };

    if (err.errors) {
        const { errors } = err;
        /// error.data = {};
        if (Array.isArray(errors)) {
            error.data = RequiredError.makePretty(errors);
        } else {
            Object.keys(errors).forEach(key => {
                error.data[key] = errors[key].message;
            });
        }
    }
    const status = err.status || HTTPStatus.NOT_FOUND;
    res.status(status).json(error);

    return next();
}
