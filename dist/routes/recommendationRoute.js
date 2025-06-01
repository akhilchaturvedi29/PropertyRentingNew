"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const recommendationcontrollers_1 = require("../controllers/recommendationcontrollers");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.post('/:propertyId', authMiddleware_1.authMiddleware, recommendationcontrollers_1.recommendProperty);
router.get('/', authMiddleware_1.authMiddleware, recommendationcontrollers_1.getReceivedRecommendations);
exports.default = router;
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODNhZWUyODc2OWM1OTk3MDdjNzg1ZDEiLCJpYXQiOjE3NDg2OTI1MjIsImV4cCI6MTc0ODc3ODkyMn0.rNmIQzgutN4FRwdmcGQsOgOIaYrF_0RP6SDJdxDUAJo
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODNhZWUyODc2OWM1OTk3MDdjNzg1ZDEiLCJpYXQiOjE3NDg2OTI1NzIsImV4cCI6MTc0ODc3ODk3Mn0.sc3pgKBluU2wJY9VLeTvLLg1NpGO5w3bvXHCFZSZ2T0
