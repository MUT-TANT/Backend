"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
    console.error('Error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}
/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.originalUrl,
    });
}
//# sourceMappingURL=errorHandler.js.map