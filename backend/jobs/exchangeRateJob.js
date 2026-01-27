import cron from 'node-cron';
import { fetchAndStoreExchangeRates } from '../services/exchangeRateService.js';

// Exchange Rate Cron Job
// Runs every 6 hours to fetch and store latest exchange rates
// Cron schedule: runs at minute 0 of every 6th hour (0:00, 6:00, 12:00, 18:00)
let cronJob = null;

export const startExchangeRateJob = () => {
  // Check if job is already running
  if (cronJob) {
    console.log('Exchange rate cron job is already running');
    return;
  }

  // Run immediately on startup
  console.log('Running initial exchange rate fetch...');
  fetchAndStoreExchangeRates().catch((error) => {
    console.error('Initial exchange rate fetch failed:', error);
  });

  // Schedule job to run every 6 hours
  cronJob = cron.schedule('0 */6 * * *', async () => {
    console.log(`[${new Date().toISOString()}] Running scheduled exchange rate update...`);
    try {
      await fetchAndStoreExchangeRates();
      console.log('Exchange rate update completed successfully');
    } catch (error) {
      console.error('Exchange rate update failed:', error);
    }
  }, {
    scheduled: true,
    timezone: 'UTC',
  });

  console.log('Exchange rate cron job started (runs every 6 hours)');
};

export const stopExchangeRateJob = () => {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log('Exchange rate cron job stopped');
  }
};

export default { startExchangeRateJob, stopExchangeRateJob };

