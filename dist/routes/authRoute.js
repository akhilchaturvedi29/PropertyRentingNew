"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Controllers_1 = require("../controllers/Controllers");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// POST /api/auth/register - User registration
router.post('/register', Controllers_1.register);
// POST /api/auth/login - User login
router.post('/login', Controllers_1.login);
// GET /api/auth/me - Get current user (protected)
router.get('/me', authMiddleware_1.authMiddleware, Controllers_1.getCurrentUser);
// POST /api/auth/logout - User logout (protected)
router.post('/logout', authMiddleware_1.authMiddleware, Controllers_1.logout);
exports.default = router;
