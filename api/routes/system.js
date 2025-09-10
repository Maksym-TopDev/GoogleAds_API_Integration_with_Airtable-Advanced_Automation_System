const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const healthCheck = require('../system/health');
    return await healthCheck(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Progress endpoint
router.get('/progress', async (req, res) => {
  try {
    const progress = require('../system/progress');
    return await progress(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test connections endpoint
router.get('/test-connections', async (req, res) => {
  try {
    const GoogleAdsClient = require('../../lib/google-ads');
    const AirtableClient = require('../../lib/airtable');
    const { logger } = require('../../lib/logger');

    const results = {
      googleAds: false,
      airtable: false,
      timestamp: new Date().toISOString()
    };

    // Test Google Ads
    try {
      const googleAds = new GoogleAdsClient();
      await googleAds.initialize();
      results.googleAds = true;
    } catch (error) {
      logger.error('Google Ads connection test failed:', error);
    }

    // Test Airtable
    try {
      const airtable = new AirtableClient();
      results.airtable = await airtable.testConnection();
    } catch (error) {
      logger.error('Airtable connection test failed:', error);
    }

    const allConnected = results.googleAds && results.airtable;

    res.status(allConnected ? 200 : 500).json({
      success: allConnected,
      results,
      message: allConnected ? 'All connections successful' : 'Some connections failed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
