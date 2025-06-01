"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReceivedRecommendations = exports.recommendProperty = void 0;
const Recommendation_1 = __importDefault(require("../models/Recommendation"));
const Property_1 = __importDefault(require("../models/Property"));
const User_1 = __importDefault(require("../models/User"));
const redisClient_1 = require("../utils/redisClient");
const recommendProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { recipientEmail, message } = req.body;
        const senderId = req.userId;
        // Check if property exists
        const property = await Property_1.default.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        // Check if recipient exists
        const recipient = await User_1.default.findOne({ email: recipientEmail });
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }
        // Don't allow recommending to yourself
        if (recipient._id.toString() === senderId.toString()) {
            return res.status(400).json({ message: 'Cannot recommend to yourself' });
        }
        // Create recommendation
        const recommendation = new Recommendation_1.default({
            property: propertyId,
            sender: senderId,
            recipient: recipient._id,
            message,
        });
        await recommendation.save();
        // Clear recommendations cache for recipient
        await redisClient_1.redisClient.del(`recommendations:${recipient._id}`);
        res.status(201).json(recommendation);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.recommendProperty = recommendProperty;
const getReceivedRecommendations = async (req, res) => {
    try {
        const userId = req.userId;
        const cacheKey = `recommendations:${userId}`;
        // Try to get cached data
        const cachedData = await redisClient_1.redisClient.get(cacheKey);
        if (cachedData) {
            return res.json(JSON.parse(cachedData));
        }
        const recommendations = await Recommendation_1.default.find({ recipient: userId })
            .populate({
            path: 'property',
            populate: {
                path: 'createdBy',
                select: 'name email',
            },
        })
            .populate('sender', 'name email');
        // Cache the result
        await redisClient_1.redisClient.setEx(cacheKey, 3600, JSON.stringify(recommendations));
        res.json(recommendations);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getReceivedRecommendations = getReceivedRecommendations;
