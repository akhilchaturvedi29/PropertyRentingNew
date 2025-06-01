"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserFavorites = exports.removeFavorite = exports.addFavorite = void 0;
const Favorite_1 = __importDefault(require("../models/Favorite"));
const Property_1 = __importDefault(require("../models/Property"));
const redisClient_1 = require("../utils/redisClient");
const addFavorite = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const userId = req.userId;
        // Check if property exists
        const property = await Property_1.default.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        // Check if already favorited
        const existingFavorite = await Favorite_1.default.findOne({ user: userId, property: propertyId });
        if (existingFavorite) {
            return res.status(400).json({ message: 'Property already in favorites' });
        }
        const favorite = new Favorite_1.default({
            user: userId,
            property: propertyId,
        });
        await favorite.save();
        // Clear favorites cache for this user
        await redisClient_1.redisClient.del(`favorites:${userId}`);
        res.status(201).json(favorite);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.addFavorite = addFavorite;
const removeFavorite = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const userId = req.userId;
        const favorite = await Favorite_1.default.findOneAndDelete({
            user: userId,
            property: propertyId,
        });
        if (!favorite) {
            return res.status(404).json({ message: 'Favorite not found' });
        }
        // Clear favorites cache for this user
        await redisClient_1.redisClient.del(`favorites:${userId}`);
        res.json({ message: 'Favorite removed successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.removeFavorite = removeFavorite;
const getUserFavorites = async (req, res) => {
    try {
        const userId = req.userId;
        const cacheKey = `favorites:${userId}`;
        // Try to get cached data
        const cachedData = await redisClient_1.redisClient.get(cacheKey);
        if (cachedData) {
            return res.json(JSON.parse(cachedData));
        }
        const favorites = await Favorite_1.default.find({ user: userId })
            .populate({
            path: 'property',
            populate: {
                path: 'createdBy',
                select: 'name email',
            },
        });
        // Cache the result
        await redisClient_1.redisClient.setEx(cacheKey, 3600, JSON.stringify(favorites));
        res.json(favorites);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getUserFavorites = getUserFavorites;
