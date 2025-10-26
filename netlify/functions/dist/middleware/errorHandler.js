"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    console.error('Error:', error);
    // Prisma errors
    if (error.code === 'P2002') {
        return res.status(409).json({
            error: 'Duplicate entry',
            message: 'A record with this information already exists'
        });
    }
    if (error.code === 'P2025') {
        return res.status(404).json({
            error: 'Not found',
            message: 'The requested record was not found'
        });
    }
    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Invalid token',
            message: 'The provided token is invalid'
        });
    }
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expired',
            message: 'The provided token has expired'
        });
    }
    // Validation errors
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation error',
            message: error.message
        });
    }
    // Default error
    res.status(error.status || 500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production'
            ? 'Something went wrong'
            : error.message
    });
};
exports.errorHandler = errorHandler;
