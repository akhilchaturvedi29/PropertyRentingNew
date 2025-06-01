"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const propertycontrollers_1 = require("../controllers/propertycontrollers");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const router = express_1.default.Router();
// Route definitions
router.post('/import', authMiddleware_1.authMiddleware, upload.single('file'), propertycontrollers_1.importProperties);
router.post('/', authMiddleware_1.authMiddleware, propertycontrollers_1.createProperty);
router.get('/', propertycontrollers_1.getProperties);
router.get('/:id', propertycontrollers_1.getPropertyById);
router.put('/:id', authMiddleware_1.authMiddleware, propertycontrollers_1.updateProperty);
router.delete('/:id', authMiddleware_1.authMiddleware, propertycontrollers_1.deleteProperty);
// Export the router
exports.default = router;
