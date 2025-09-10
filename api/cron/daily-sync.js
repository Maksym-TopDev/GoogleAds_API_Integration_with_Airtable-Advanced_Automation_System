const { config } = require('../../config/environment');
const { logger } = require('../../lib/logger');

module.exports = async function handler(req, res) {
  try {
    logger.info('Starting daily sync cron job');

    // Get yesterday's date for data pull
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateRange = {
      start: yesterday.toISOString().split('T')[0],
      end: yesterday.toISOString().split('T')[0]
    };

    // Get customer IDs from environment
    const customerIds = [
      config.googleAds.customerId,
      config.googleAds.mccCustomerId
    ].filter(Boolean);

    if (customerIds.length === 0) {
      throw new Error('No customer IDs configured');
    }

    logger.info('Daily sync parameters', { customerIds, dateRange });

    // Call the data pull endpoint
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/data/pull-performance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerIds,
        dateRange
      })
    });

    if (!response.ok) {
      throw new Error(`Data pull failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    logger.info('Daily sync completed successfully', result);

    res.status(200).json({
      success: true,
      message: 'Daily sync completed successfully',
      result: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Daily sync failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
