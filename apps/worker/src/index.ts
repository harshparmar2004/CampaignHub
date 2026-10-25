import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

import { startCampaignExpansionWorker } from './queues/campaignExpansionWorker.js';
import { startMessageDispatchWorker } from './queues/messageDispatchWorker.js';
import { startCampaignScheduler, stopCampaignScheduler } from './scheduler/campaignScheduler.js';
import { redisConnection } from './lib/redis.js';

console.log('====================================================');
console.log('   CampaignHub 24/7 Delivery Worker Service Starting');
console.log('====================================================');

// Start queue workers
const expansionWorker = startCampaignExpansionWorker();
const dispatchWorker = startMessageDispatchWorker();

// Start 30-second campaign poller
startCampaignScheduler(30000);

// Embedded HTTP /health server for Railway / Render healthchecks
const port = parseInt(process.env.PORT || '8080', 10);
const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'healthy',
        service: 'campaignhub-worker',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      })
    );
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(port, () => {
  console.log(`[Health Server] HTTP health endpoint listening on port ${port} (/health)`);
});

// Graceful shutdown handling
let isShuttingDown = false;
async function handleShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n[Shutdown] Received ${signal}. Commencing graceful shutdown...`);

  stopCampaignScheduler();

  server.close(() => {
    console.log('[Shutdown] Health HTTP server closed.');
  });

  try {
    await Promise.all([
      expansionWorker.close(),
      dispatchWorker.close(),
    ]);
    console.log('[Shutdown] BullMQ queue workers closed.');

    await redisConnection.quit();
    console.log('[Shutdown] Redis connection closed.');
  } catch (err: any) {
    console.error('[Shutdown] Error during shutdown cleanup:', err.message);
  }

  console.log('[Shutdown] Worker process exited cleanly.');
  process.exit(0);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
