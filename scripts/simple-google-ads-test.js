const { GoogleAdsApi } = require('google-ads-api');
const { config } = require('../config/environment');

async function simpleTest() {
  console.log('🔍 Simple Google Ads API Test');
  console.log('=============================\n');

  console.log('📊 Configuration:');
  console.log(`  Developer Token: ${config.googleAds.developerToken}`);
  console.log(`  Client ID: ${config.googleAds.clientId}`);
  console.log(`  Client Secret: ${config.googleAds.clientSecret ? 'Set' : 'Not Set'}`);
  console.log(`  Refresh Token: ${config.googleAds.refreshToken ? 'Set' : 'Not Set'}`);
  console.log(`  Customer ID: ${config.googleAds.customerId}`);
  console.log(`  MCC Customer ID: ${config.googleAds.mccCustomerId}\n`);

  try {
    // Initialize the client
    const client = new GoogleAdsApi({
      developer_token: config.googleAds.developerToken,
      client_id: config.googleAds.clientId,
      client_secret: config.googleAds.clientSecret,
      refresh_token: config.googleAds.refreshToken,
      login_customer_id: config.googleAds.mccCustomerId
    });

    console.log('✅ Google Ads API client created successfully\n');

    // Get customer instance
    const customer = client.Customer(String(config.googleAds.customerId));
    console.log('✅ Customer instance created successfully\n');

    // Test a simple query
    console.log('🔍 Testing simple campaign query...');
    const query = `
      SELECT 
        campaign.id,
        campaign.name,
        campaign.status
      FROM campaign
      LIMIT 5
    `;

    console.log('Query:', query);
    console.log('Executing query...\n');

    const response = await customer.query(query);
    
    console.log('✅ Query executed successfully!');
    console.log(`📊 Found ${response.length} campaigns\n`);

    if (response.length > 0) {
      console.log('📋 Campaign Results:');
      console.log('===================');
      response.forEach((campaign, index) => {
        console.log(`\nCampaign ${index + 1}:`);
        console.log(`  ID: ${campaign.campaign?.id}`);
        console.log(`  Name: ${campaign.campaign?.name}`);
        console.log(`  Status: ${campaign.campaign?.status}`);
      });
    } else {
      console.log('ℹ️  No campaigns found');
    }

  } catch (error) {
    console.error('❌ Error occurred:');
    console.error('  Code:', error.code);
    console.error('  Message:', error.message);
    console.error('  Details:', error.details);
    
    if (error.code === 2) {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check if your refresh token is valid');
      console.log('2. Verify OAuth credentials in Google Cloud Console');
      console.log('3. Ensure the customer ID has access to the account');
      console.log('4. Check if the developer token is approved');
    }
  }
}

// Run the test
simpleTest();
