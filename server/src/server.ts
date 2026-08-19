import { app } from './app.js';
import { config } from './config/env.js';

const server = app.listen(config.port, () => {
  console.log(`✨ Skincare API Server running on port ${config.port} in ${config.nodeEnv} mode`);
  console.log(`🌿 Health check available at http://localhost:${config.port}/api/health`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server gracefully.');
  server.close(() => {
    console.log('HTTP server closed.');
  });
});
