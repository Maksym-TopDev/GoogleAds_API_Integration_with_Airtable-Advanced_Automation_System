const GoogleAdsClient = require('../../lib/google-ads');
const AirtableClient = require('../../lib/airtable');
const { config } = require('../../config/environment');
const { logger } = require('../../lib/logger');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('Health check requested');

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {},
      environment: {
        nodeEnv: config.app.nodeEnv,
        logLevel: config.app.logLevel
      }
    };

    // Test Google Ads connection
    try {
      const googleAds = new GoogleAdsClient();
      await googleAds.initialize();
      const token = await googleAds.getAccessToken();
      
      health.services.googleAds = {
        status: 'connected',
        hasToken: !!token,
        customerId: config.googleAds.customerId,
        mccCustomerId: config.googleAds.mccCustomerId
      };
    } catch (error) {
      health.services.googleAds = {
        status: 'error',
        error: error.message
      };
      health.status = 'degraded';
    }

    // Test Airtable connection
    try {
      const airtable = new AirtableClient();
      const connected = await airtable.testConnection();
      
      health.services.airtable = {
        status: connected ? 'connected' : 'error',
        baseId: config.airtable.baseId
      };
      
      if (!connected) {
        health.status = 'degraded';
      }
    } catch (error) {
      health.services.airtable = {
        status: 'error',
        error: error.message
      };
      health.status = 'degraded';
    }

    // Test Claude API (basic check)
    try {
      if (config.claude.apiKey) {
        health.services.claude = {
          status: 'configured',
          hasApiKey: true
        };
      } else {
        health.services.claude = {
          status: 'not_configured',
          hasApiKey: false
        };
      }
    } catch (error) {
      health.services.claude = {
        status: 'error',
        error: error.message
      };
    }

    // Overall status
    const hasErrors = Object.values(health.services).some(service => service.status === 'error');
    if (hasErrors) {
      health.status = 'unhealthy';
    }

    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 500;

    logger.info('Health check completed', { status: health.status });

    res.status(statusCode).json(health);

  } catch (error) {
    logger.error('Health check failed:', error);
    
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
