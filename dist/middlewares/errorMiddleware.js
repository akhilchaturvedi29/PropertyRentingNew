"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    res.status(500).json({ message: 'Something went wrong' });
};
exports.errorHandler = errorHandler;
const notFound = (req, res) => {
    res.status(404).json({ message: 'Not found' });
};
exports.notFound = notFound;
