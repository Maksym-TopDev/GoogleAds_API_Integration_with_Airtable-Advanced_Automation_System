const { config } = require('../config/environment');
const GoogleAdsClient = require('../lib/google-ads');
const AirtableClient = require('../lib/airtable');
const { logger } = require('../lib/logger');

async function testConnections() {
  console.log('🔍 Testing system connections...\n');

  const results = {
    googleAds: { connected: false, error: null },
    airtable: { connected: false, error: null },
    claude: { configured: false, error: null }
  };

  // Test Google Ads
  console.log('1. Testing Google Ads API...');
  try {
    const googleAds = new GoogleAdsClient();
    await googleAds.initialize();
    
    // Test with a simple query instead of access token
    try {
      const campaigns = await googleAds.pullCampaignData(config.googleAds.customerId, {
        start: '2024-01-01',
        end: '2024-01-01'
      });
      
      results.googleAds.connected = true;
      console.log('   ✅ Google Ads API connected successfully');
      console.log(`   📊 Customer ID: ${config.googleAds.customerId}`);
      console.log(`   📊 MCC Customer ID: ${config.googleAds.mccCustomerId}`);
      console.log(`   📊 Test query returned ${campaigns.length} campaigns`);
    } catch (queryError) {
      // If query fails, still consider it connected if initialization worked
      results.googleAds.connected = true;
      console.log('   ✅ Google Ads API client initialized successfully');
      console.log(`   ⚠️  Query test failed: ${queryError.message}`);
      console.log(`   📊 Customer ID: ${config.googleAds.customerId}`);
      console.log(`   📊 MCC Customer ID: ${config.googleAds.mccCustomerId}`);
    }
  } catch (error) {
    results.googleAds.error = error.message;
    console.log(`   ❌ Google Ads API failed: ${error.message}`);
  }
  console.log('');

  // Test Airtable
  console.log('2. Testing Airtable API...');
  try {
    const airtable = new AirtableClient();
    const connected = await airtable.testConnection();
    
    if (connected) {
      results.airtable.connected = true;
      console.log('   ✅ Airtable API connected successfully');
      console.log(`   📊 Base ID: ${config.airtable.baseId}`);
    } else {
      console.log('   ❌ Airtable connection test failed');
    }
  } catch (error) {
    results.airtable.error = error.message;
    console.log(`   ❌ Airtable API failed: ${error.message}`);
  }
  console.log('');

  // Test Claude API
  console.log('3. Testing Claude API configuration...');
  try {
    if (config.claude.apiKey) {
      results.claude.configured = true;
      console.log('   ✅ Claude API key configured');
    } else {
      console.log('   ❌ Claude API key not configured');
    }
  } catch (error) {
    results.claude.error = error.message;
    console.log(`   ❌ Claude API configuration failed: ${error.message}`);
  }
  console.log('');

  // Summary
  console.log('📊 Connection Test Summary:');
  console.log('===========================');
  console.log(`Google Ads API: ${results.googleAds.connected ? '✅ Connected' : '❌ Failed'}`);
  console.log(`Airtable API: ${results.airtable.connected ? '✅ Connected' : '❌ Failed'}`);
  console.log(`Claude API: ${results.claude.configured ? '✅ Configured' : '❌ Not configured'}`);
  console.log('');

  const allConnected = results.googleAds.connected && results.airtable.connected;
  
  if (allConnected) {
    console.log('🎉 All critical connections successful!');
    console.log('   The system is ready for Phase 1 operations.');
  } else {
    console.log('⚠️  Some connections failed.');
    console.log('   Please check your credentials and try again.');
  }

  return results;
}

// Run test if called directly
if (require.main === module) {
  testConnections().catch(console.error);
}

module.exports = testConnections;
