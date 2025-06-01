"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const favoritecontrollers_1 = require("../controllers/favoritecontrollers");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.post('/:propertyId', authMiddleware_1.authMiddleware, favoritecontrollers_1.addFavorite);
router.delete('/:propertyId', authMiddleware_1.authMiddleware, favoritecontrollers_1.removeFavorite);
router.get('/', authMiddleware_1.authMiddleware, favoritecontrollers_1.getUserFavorites);
exports.default = router;
