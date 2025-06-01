"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importPropertiesDirect = exports.importPropertiesFromFile = exports.getImportTemplate = exports.deleteProperty = exports.updateProperty = exports.getPropertyById = exports.getProperties = exports.createProperty = exports.importProperties = void 0;
const Property_1 = __importDefault(require("../models/Property"));
const redisClient_1 = require("../utils/redisClient");
const csvtojson_1 = __importDefault(require("csvtojson"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const CACHE_EXPIRATION = 3600; // 1 hour in seconds
// CSV Import Function
const importProperties = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Check file type
        if (!req.file.mimetype.includes('csv') && !req.file.originalname.endsWith('.csv')) {
            return res.status(400).json({
                message: 'Invalid file type. Please upload a CSV file.',
                receivedType: req.file.mimetype
            });
        }
        const userId = req.userId;
        const csvData = req.file.buffer.toString('utf-8').replace(/^\uFEFF/, ''); // Remove BOM if present
        const jsonArray = await (0, csvtojson_1.default)({
            checkType: true,
            trim: true,
            colParser: {
                'price': 'number',
                'areaSqFt': 'number',
                'bedrooms': 'number',
                'bathrooms': 'number',
                'rating': 'number',
                'isVerified': (item) => item.toLowerCase() === 'true',
                'amenities': (item) => item.replace(/^"|"$/g, '').split('|'),
                'tags': (item) => item.replace(/^"|"$/g, '').split('|'),
                'availableFrom': (item) => new Date(item)
            }
        }).fromString(csvData);
        // Validate required fields
        const requiredFields = ['id', 'title', 'type', 'price', 'state', 'city'];
        const invalidRows = jsonArray.filter((row) => requiredFields.some(field => !row[field]));
        if (invalidRows.length > 0) {
            return res.status(400).json({
                message: 'Invalid data in CSV',
                invalidRows: invalidRows.map((row) => row.id)
            });
        }
        const properties = jsonArray.map((item) => ({
            id: item.id,
            title: item.title,
            type: item.type,
            price: item.price,
            state: item.state,
            city: item.city,
            areaSqFt: item.areaSqFt,
            bedrooms: item.bedrooms,
            bathrooms: item.bathrooms,
            amenities: item.amenities,
            furnished: item.furnished,
            availableFrom: item.availableFrom,
            listedBy: item.listedBy,
            tags: item.tags,
            colorTheme: item.colorTheme,
            rating: item.rating,
            isVerified: item.isVerified,
            listingType: item.listingType,
            createdBy: userId
        }));
        const result = await Property_1.default.bulkWrite(properties.map(property => ({
            updateOne: {
                filter: { id: property.id },
                update: { $setOnInsert: property },
                upsert: true
            }
        })));
        await redisClient_1.redisClient.del('properties:all');
        res.status(201).json({
            message: 'Properties imported successfully',
            insertedCount: result.upsertedCount,
            modifiedCount: result.modifiedCount
        });
    }
    catch (error) {
        console.error('CSV import error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            message: 'Failed to import properties',
            error: errorMessage
        });
    }
};
exports.importProperties = importProperties;
// Create Property
const createProperty = async (req, res) => {
    try {
        const { id, title, type, price, state, city, areaSqFt, bedrooms, bathrooms, amenities, furnished, availableFrom, listedBy, tags, colorTheme, rating, isVerified, listingType } = req.body;
        const userId = req.userId;
        const property = new Property_1.default({
            id,
            title,
            type,
            price,
            state,
            city,
            areaSqFt,
            bedrooms,
            bathrooms,
            amenities,
            furnished,
            availableFrom,
            listedBy,
            tags,
            colorTheme,
            rating,
            isVerified,
            listingType,
            createdBy: userId,
        });
        await property.save();
        await redisClient_1.redisClient.del('properties:all');
        res.status(201).json(property);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createProperty = createProperty;
// Get All Properties
const getProperties = async (req, res) => {
    try {
        const { location, minPrice, maxPrice, bedrooms, bathrooms, minArea, maxArea, type, status, amenities, search, sortBy, sortOrder = 'asc', page = 1, limit = 10 } = req.query;
        const cacheKey = `properties:${JSON.stringify(req.query)}`;
        const cachedData = await redisClient_1.redisClient.get(cacheKey);
        if (cachedData)
            return res.json(JSON.parse(cachedData));
        const query = {};
        if (location)
            query.location = { $regex: location, $options: 'i' };
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice)
                query.price.$gte = Number(minPrice);
            if (maxPrice)
                query.price.$lte = Number(maxPrice);
        }
        if (bedrooms)
            query.bedrooms = Number(bedrooms);
        if (bathrooms)
            query.bathrooms = Number(bathrooms);
        if (minArea || maxArea) {
            query.areaSqFt = {};
            if (minArea)
                query.areaSqFt.$gte = Number(minArea);
            if (maxArea)
                query.areaSqFt.$lte = Number(maxArea);
        }
        if (type)
            query.type = type;
        if (status)
            query.status = status;
        if (amenities) {
            query.amenities = { $all: amenities.split(',') };
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
            ];
        }
        const [properties, total] = await Promise.all([
            Property_1.default.find(query)
                .sort(sortBy ? { [sortBy]: sortOrder === 'asc' ? 1 : -1 } : {})
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit))
                .populate('createdBy', 'name email'),
            Property_1.default.countDocuments(query),
        ]);
        const result = {
            properties,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
        };
        await redisClient_1.redisClient.setEx(cacheKey, CACHE_EXPIRATION, JSON.stringify(result));
        res.json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getProperties = getProperties;
// Get Property by ID
const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `property:${id}`;
        const cachedData = await redisClient_1.redisClient.get(cacheKey);
        if (cachedData)
            return res.json(JSON.parse(cachedData));
        const property = await Property_1.default.findById(id).populate('createdBy', 'name email');
        if (!property)
            return res.status(404).json({ message: 'Property not found' });
        await redisClient_1.redisClient.setEx(cacheKey, CACHE_EXPIRATION, JSON.stringify(property));
        res.json(property);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getPropertyById = getPropertyById;
// Update Property
const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        // const property = await Property.findById(id);
        const property = await Property_1.default.findOne({ id }).populate('createdBy', 'name email');
        if (!property)
            return res.status(404).json({ message: 'Property not found' });
        if (property.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this property' });
        }
        const updatedProperty = await Property_1.default.findByIdAndUpdate(id, { $set: req.body }, { new: true });
        await Promise.all([
            redisClient_1.redisClient.del(`property:${id}`),
            redisClient_1.redisClient.del('properties:all'),
        ]);
        res.json(updatedProperty);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateProperty = updateProperty;
// Delete Property
const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const property = await Property_1.default.findById(id);
        if (!property)
            return res.status(404).json({ message: 'Property not found' });
        if (property.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this property' });
        }
        await Property_1.default.findByIdAndDelete(id);
        await Promise.all([
            redisClient_1.redisClient.del(`property:${id}`),
            redisClient_1.redisClient.del('properties:all'),
        ]);
        res.json({ message: 'Property deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteProperty = deleteProperty;
// Get Import Template
const getImportTemplate = async (req, res) => {
    try {
        const template = {
            id: 'PROP1000',
            title: 'Sample Property',
            type: 'Apartment|Villa|Bungalow',
            price: 1000000,
            state: 'State Name',
            city: 'City Name',
            areaSqFt: 1500,
            bedrooms: 2,
            bathrooms: 2,
            amenities: 'lift|parking|pool (pipe separated)',
            furnished: 'Furnished|Unfurnished|Semi',
            availableFrom: 'YYYY-MM-DD',
            listedBy: 'Builder|Owner|Agent',
            tags: 'gated-community|near-metro (pipe separated)',
            colorTheme: '#hexcolor',
            rating: 4.5,
            isVerified: true,
            listingType: 'rent|sale'
        };
        res.json(template);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getImportTemplate = getImportTemplate;
// Direct File Import Function
const importPropertiesFromFile = async (filePath, userId) => {
    try {
        const csvData = fs_1.default.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, ''); // Remove BOM if present
        const jsonArray = await (0, csvtojson_1.default)({
            checkType: true,
            trim: true,
            colParser: {
                'price': 'number',
                'areaSqFt': 'number',
                'bedrooms': 'number',
                'bathrooms': 'number',
                'rating': 'number',
                'isVerified': (item) => item.toLowerCase() === 'true',
                'amenities': (item) => item.replace(/^"|"$/g, '').split('|'),
                'tags': (item) => item.replace(/^"|"$/g, '').split('|'),
                'availableFrom': (item) => new Date(item)
            }
        }).fromString(csvData);
        // Validate required fields
        const requiredFields = ['id', 'title', 'type', 'price', 'state', 'city'];
        const invalidRows = jsonArray.filter((row) => requiredFields.some(field => !row[field]));
        if (invalidRows.length > 0) {
            throw new Error(`Invalid data in CSV for rows: ${invalidRows.map((row) => row.id).join(', ')}`);
        }
        const properties = jsonArray.map((item) => ({
            id: item.id,
            title: item.title,
            type: item.type,
            price: item.price,
            state: item.state,
            city: item.city,
            areaSqFt: item.areaSqFt,
            bedrooms: item.bedrooms,
            bathrooms: item.bathrooms,
            amenities: item.amenities,
            furnished: item.furnished,
            availableFrom: item.availableFrom,
            listedBy: item.listedBy,
            tags: item.tags,
            colorTheme: item.colorTheme,
            rating: item.rating,
            isVerified: item.isVerified,
            listingType: item.listingType,
            createdBy: userId
        }));
        const result = await Property_1.default.bulkWrite(properties.map(property => ({
            updateOne: {
                filter: { id: property.id },
                update: { $setOnInsert: property },
                upsert: true
            }
        })));
        await redisClient_1.redisClient.del('properties:all');
        return {
            message: 'Properties imported successfully',
            insertedCount: result.upsertedCount,
            modifiedCount: result.modifiedCount
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to import properties: ${errorMessage}`);
    }
};
exports.importPropertiesFromFile = importPropertiesFromFile;
// Add a new route for direct file import
const importPropertiesDirect = async (req, res) => {
    try {
        const userId = req.userId;
        const filePath = path_1.default.join(__dirname, '../../property_listing.csv');
        const result = await (0, exports.importPropertiesFromFile)(filePath, userId);
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Direct import error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            message: 'Failed to import properties',
            error: errorMessage
        });
    }
};
exports.importPropertiesDirect = importPropertiesDirect;
