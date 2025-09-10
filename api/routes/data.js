const express = require('express');
const router = express.Router();

// Data pull endpoint
router.post('/pull-performance', async (req, res) => {
  try {
    const { customerIds, dateRange } = req.body;
    
    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({ error: 'customerIds is required and must be an array' });
    }

    if (!dateRange || !dateRange.start || !dateRange.end) {
      return res.status(400).json({ error: 'dateRange with start and end dates is required' });
    }

    // Import and use the data pull function
    const pullPerformance = require('../data/pull-performance');
    return await pullPerformance(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get data status
router.get('/status', async (req, res) => {
  try {
    const AirtableClient = require('../../lib/airtable');
    const airtable = new AirtableClient();
    
    // Get counts from each table
    const [campaigns, adGroups, keywords, ads] = await Promise.all([
      airtable.base('Campaigns').select({ maxRecords: 1 }).all(),
      airtable.base('Ad Groups').select({ maxRecords: 1 }).all(),
      airtable.base('Keywords').select({ maxRecords: 1 }).all(),
      airtable.base('Ads').select({ maxRecords: 1 }).all()
    ]);

    res.json({
      success: true,
      data: {
        campaigns: campaigns.length,
        adGroups: adGroups.length,
        keywords: keywords.length,
        ads: ads.length,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
