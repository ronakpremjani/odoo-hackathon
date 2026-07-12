import mongoose from 'mongoose';
import { config } from '../config/env';
import { seedDB } from './seed';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed database with default roles and admin
    await seedDB();
  } catch (error) {
    console.error(`Database Connection Error: ${(error as Error).message}`);
    // Exit process with failure in production, retry or log in dev
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err}`);
});
