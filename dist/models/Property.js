"use strict";
// import mongoose, { Schema, Document } from 'mongoose';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// export interface IProperty extends Document {
//   id: string;
//   title: string;
//   type: string;
//   price: number;
//   state: string;
//   city: string;
//   areaSqFt: number;
//   bedrooms: number;
//   bathrooms: number;
//   amenities: string[];
//   furnished: string;
//   availableFrom: Date;
//   listedBy: string;
//   tags: string[];
//   colorTheme: string;
//   rating: number;
//   isVerified: boolean;
//   listingType: string;
//   createdBy: mongoose.Types.ObjectId;
// }
// const propertySchema = new Schema<IProperty>({
//   id: { type: String, required: true, unique: true }, // ✅ Custom ID
//   title: { type: String, required: true },
//   type: { type: String, required: true },
//   price: { type: Number, required: true },
//   state: { type: String },
//   city: { type: String },
//   areaSqFt: { type: Number },
//   bedrooms: { type: Number },
//   bathrooms: { type: Number },
//   amenities: [{ type: String }],
//   furnished: { type: String },
//   availableFrom: { type: Date },
//   listedBy: { type: String },
//   tags: [{ type: String }],
//   colorTheme: { type: String },
//   rating: { type: Number },
//   isVerified: { type: Boolean },
//   listingType: { type: String },
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// }, {
//   timestamps: true
// });
// propertySchema.index({ city: 1, state: 1, type: 1, listingType: 1, price: 1 });
// propertySchema.index({ amenities: 1 });
// propertySchema.index({ tags: 1 });
// export default mongoose.model<IProperty>('Property', propertySchema);
const mongoose_1 = __importStar(require("mongoose"));
const propertySchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    state: { type: String },
    city: { type: String },
    areaSqFt: { type: Number },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    amenities: [{ type: String }],
    furnished: { type: String },
    availableFrom: { type: Date },
    listedBy: { type: String },
    tags: [{ type: String }],
    colorTheme: { type: String },
    rating: { type: Number },
    isVerified: { type: Boolean },
    listingType: { type: String },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});
propertySchema.index({ city: 1, state: 1, type: 1, listingType: 1, price: 1 });
propertySchema.index({ amenities: 1 });
propertySchema.index({ tags: 1 });
exports.default = mongoose_1.default.model('Property', propertySchema);
