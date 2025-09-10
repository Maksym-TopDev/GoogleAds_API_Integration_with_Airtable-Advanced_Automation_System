const axios = require('axios');
const { config } = require('../config/environment');

function getYesterdayRange() {
  const today = new Date();
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  const d = y.toISOString().split('T')[0];
  return { start: d, end: d };
}

(async () => {
  try {
    const base = process.env.BASE_URL || 'http://localhost:3000';

    // Build customerIds from env
    const customerIds = [];
    if (config.googleAds.customerId) customerIds.push(config.googleAds.customerId);
    if (config.googleAds.mccCustomerId) customerIds.push(config.googleAds.mccCustomerId);

    if (customerIds.length === 0) {
      throw new Error('No Google Ads customer IDs configured. Set GOOGLE_ADS_CUSTOMER_ID in .env');
    }

    const dateRange = getYesterdayRange();
    console.log('Triggering data pull...', { customerIds, dateRange });

    // 1) Trigger data pull (extract from Ads, write to Airtable)
    try {
      const pullRes = await axios.post(
        `${base}/api/data/pull-performance`,
        { customerIds, dateRange },
        { timeout: 60000 }
      );
      console.log('Data pull result:', pullRes.data?.results || pullRes.data);
    } catch (e) {
      console.error('Data pull failed:', e.response?.data || e.message);
    }

    // 2) Fetch progress summary
    try {
      const { data } = await axios.get(`${base}/api/system/progress`, { timeout: 15000 });
      const services = Object.entries(data.services || {})
        .map(([k, v]) => `${k}:${v.status}`)
        .join(', ');

      console.log('\nProject Progress');
      console.log('================');
      console.log(`Time: ${data.timestamp}`);
      console.log(`Env: ${data.environment}`);
      console.log(`Services: ${services}`);
      if (data.airtable) {
        console.log(`Airtable recency (days): ${data.airtable.recencyDays ?? 'n/a'}`);
        console.log(`Counts: ${JSON.stringify(data.airtable.counts || {})}`);
      }
    } catch (e) {
      console.error('Progress fetch failed:', e.response?.data || e.message);
    }
  } catch (e) {
    console.error('Progress check failed:', e.message);
    console.error('Tip: Ensure the server is running with "npm start" before running this command.');
    process.exit(1);
  }
})();
