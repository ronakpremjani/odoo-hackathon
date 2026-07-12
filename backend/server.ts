import app from './src/app';
import { config } from './src/config/env';
import { connectDB } from './src/database/connection';

// Connect to Database
connectDB();

const PORT = config.PORT;

const server = app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`  TransitOps Server running on port ${PORT} `);
  console.log(`  Environment: ${config.NODE_ENV}           `);
  console.log(`========================================`);
});

// Handle global unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! Shutting down server...');
  console.error(err.name, err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
});

// Handle global uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down server...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});
