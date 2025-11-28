import mongoose from 'mongoose';
import logger from './logger';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Parse and validate MongoDB URI
    let connectionString = mongoURI.trim();
    
    // Fix common MongoDB Atlas connection string issues
    // Remove any trailing slashes or extra parameters that might cause issues
    if (connectionString.includes('mongodb+srv://')) {
      // For MongoDB Atlas, ensure proper format
      // mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
      if (!connectionString.includes('?')) {
        connectionString += '?retryWrites=true&w=majority';
      }
    }

    const conn = await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error('Error connecting to MongoDB:', {
      message: error.message,
      name: error.name,
    });
    
    // Provide helpful error messages
    if (error.message.includes('Server record does not share hostname')) {
      logger.error('MongoDB Connection Error: Invalid connection string format.');
      logger.error('For MongoDB Atlas, ensure your connection string format is:');
      logger.error('mongodb+srv://username:password@cluster.mongodb.net/database');
      logger.error('For local MongoDB, use: mongodb://localhost:27017/database');
    }
    
    console.error('Error connecting to MongoDB:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your MONGODB_URI in backend/.env');
    console.error('2. For MongoDB Atlas: Ensure IP whitelist includes 0.0.0.0/0 or your IP');
    console.error('3. For local MongoDB: Ensure MongoDB service is running');
    console.error('4. Verify connection string format is correct\n');
    
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
};

