import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error('❌ MONGO_URL environment variable is not defined');
  }

  try {
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1); // Cierra la app si no puede conectar
  }
};

export default connectDB;
