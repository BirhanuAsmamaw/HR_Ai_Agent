const { app, supabase } = require('./app');
const { PORT = 4000 } = process.env;


const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Health Check: http://localhost:${PORT}/health`);
  console.log(`Jobs API: http://localhost:${PORT}/api/jobs`);
});


process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  
  server.close(() => {
    console.log('Process terminated!');
    process.exit(1);
  });
});


process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err);
  
  server.close(() => {
    console.log('💥 Process terminated!');
    process.exit(1);
  });
});


process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
    process.exit(0);
  });
});
