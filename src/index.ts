  import express from 'express';
  import cors from 'cors';
  import mongoose from 'mongoose';
  import dotenv from 'dotenv';
  import  propertyRoute  from './routes/propertyRoute';
  import authRoute from './routes/authRoute';
  import favoriteRoute from './routes/favoriteRoute';
  import recommendationRoute from './routes/recommendationRoute';
  import csvImportRoute from './routes/csvImportRoute';
  import { connectRedis } from './utils/redisClient';
  import { errorHandler, notFound } from './middlewares/errorMiddleware';

  dotenv.config();
  const app = express();
  const PORT = process.env.PORT || 5000;

  // Middlewares
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api/auth', authRoute);
  app.use('/api/properties', propertyRoute);
  app.use('/api/favorites', favoriteRoute);
  app.use('/api/recommendations', recommendationRoute);
  app.use('/api/csv-import', csvImportRoute);

  // Health check
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
  });

  // Error handling
  app.use(notFound);
  app.use(errorHandler);

  // Connect to MongoDB and start server
  mongoose
    .connect(process.env.MONGO_URI as string)
    .then(async () => {
      console.log('Connected to MongoDB');
      await connectRedis();
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => console.log('MongoDB connection error:', err));