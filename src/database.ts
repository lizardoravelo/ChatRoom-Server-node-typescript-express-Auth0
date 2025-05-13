import mongoose, { ConnectOptions } from 'mongoose';
import config from '@config/constants';

if (!config.mongo.uri) {
  throw new Error('MONGODB_URL environment variable is not defined');
}

mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongo.uri, {} as ConnectOptions);
    console.log('DB is connected');
  } catch (error) {
    console.error('Error connecting to the database', error);
    process.exit(1);
  }
};

connectDB();

// Handling connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.once('open', () => {
  console.log('DB connection is open');
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected');
});

// Handle process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

export default mongoose.connection;
