import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import errorHandler from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());
app.use(helmet()); // Adds security-related HTTP headers

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import and use your routes
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import loginRoutes from './routes/loginRoutes.js'; 

app.use('/user', authRoutes);
app.use('/login', loginRoutes); // Changed the route prefix to avoid conflict with authRoutes
app.use('/contact', contactRoutes);

// Custom error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 7100;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
