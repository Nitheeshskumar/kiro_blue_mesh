"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    console.error('Error:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: error.message
        });
    }
    if (error.code === 'P2002') {
        return res.status(409).json({
            error: 'Duplicate entry',
            details: 'A record with this information already exists'
        });
    }
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map