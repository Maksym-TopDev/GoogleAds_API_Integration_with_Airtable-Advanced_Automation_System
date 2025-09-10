const AirtableClient = require('../../lib/airtable');
const GoogleAdsClient = require('../../lib/google-ads');
const { config } = require('../../config/environment');
const { logger } = require('../../lib/logger');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const progress = {
      timestamp: new Date().toISOString(),
      environment: config.app.nodeEnv,
      services: {},
      airtable: {
        recencyDays: null,
        counts: {}
      }
    };

    // Google Ads init status
    try {
      const googleAds = new GoogleAdsClient();
      await googleAds.initialize();
      progress.services.googleAds = { status: 'ok' };
    } catch (e) {
      progress.services.googleAds = { status: 'error', error: e.message };
    }

    // Airtable counts + recency
    try {
      const airtable = new AirtableClient();
      const connected = await airtable.testConnection();
      if (!connected) throw new Error('Airtable not connected');

      const [campaigns, adGroups, keywords, ads] = await Promise.all([
        airtable.base('Campaigns').select({ fields: ['Last Updated'], sort: [{ field: 'Last Updated', direction: 'desc' }], pageSize: 1 }).all(),
        airtable.base('Ad Groups').select({ pageSize: 1 }).all(),
        airtable.base('Keywords').select({ pageSize: 1 }).all(),
        airtable.base('Ads').select({ pageSize: 1 }).all()
      ]);

      progress.services.airtable = { status: 'ok' };
      progress.airtable.counts = {
        campaigns: campaigns.length,
        adGroups: adGroups.length,
        keywords: keywords.length,
        ads: ads.length
      };

      const lastUpdated = campaigns[0]?.fields?.['Last Updated'];
      if (lastUpdated) {
        const days = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24));
        progress.airtable.recencyDays = days;
      }
    } catch (e) {
      progress.services.airtable = { status: 'error', error: e.message };
    }

    const overallOk = Object.values(progress.services).every(s => s.status === 'ok');
    res.status(overallOk ? 200 : 207).json(progress);
  } catch (error) {
    logger.error('Progress endpoint failed:', error);
    res.status(500).json({ error: error.message });
  }
}
