"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const favoriteSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    property: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Property', required: true },
}, { timestamps: true });
favoriteSchema.index({ user: 1, property: 1 }, { unique: true });
exports.default = mongoose_1.default.model('Favorite', favoriteSchema);
