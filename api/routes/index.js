const express = require('express');
const router = express.Router();

// Import route modules
const dataRoutes = require('./data');
const adsRoutes = require('./ads');
const analysisRoutes = require('./analysis');
const systemRoutes = require('./system');

// Mount routes
router.use('/data', dataRoutes);
router.use('/ads', adsRoutes);
router.use('/analysis', analysisRoutes);
router.use('/system', systemRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Google Ads Airtable Automation API',
    version: '1.0.0',
    description: 'Serverless API for Google Ads and Airtable integration',
    endpoints: {
      data: '/api/data',
      ads: '/api/ads',
      analysis: '/api/analysis',
      system: '/api/system'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
