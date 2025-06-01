"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const propertyRoute_1 = __importDefault(require("./routes/propertyRoute"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const favoriteRoute_1 = __importDefault(require("./routes/favoriteRoute"));
const recommendationRoute_1 = __importDefault(require("./routes/recommendationRoute"));
const csvImportRoute_1 = __importDefault(require("./routes/csvImportRoute"));
const redisClient_1 = require("./utils/redisClient");
const errorMiddleware_1 = require("./middlewares/errorMiddleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', authRoute_1.default);
app.use('/api/properties', propertyRoute_1.default);
app.use('/api/favorites', favoriteRoute_1.default);
app.use('/api/recommendations', recommendationRoute_1.default);
app.use('/api/csv-import', csvImportRoute_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});
// Error handling
app.use(errorMiddleware_1.notFound);
app.use(errorMiddleware_1.errorHandler);
// Connect to MongoDB and start server
mongoose_1.default
    .connect(process.env.MONGO_URI)
    .then(async () => {
    console.log('Connected to MongoDB');
    await (0, redisClient_1.connectRedis)();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
    .catch((err) => console.log('MongoDB connection error:', err));
