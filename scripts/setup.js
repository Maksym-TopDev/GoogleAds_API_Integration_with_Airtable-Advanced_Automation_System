const fs = require('fs');
const path = require('path');
const { config, validateConfig } = require('../config/environment');
const { logger } = require('../lib/logger');

async function setup() {
  try {
    console.log('🚀 Setting up Google Ads Airtable Automation System...\n');

    // Validate configuration
    console.log('📋 Validating configuration...');
    validateConfig();
    console.log('✅ Configuration validated\n');

    // Create necessary directories
    console.log('📁 Creating directories...');
    const dirs = ['logs', 'data', 'temp'];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      } else {
        console.log(`✅ Directory exists: ${dir}`);
      }
    });
    console.log('');

    // Test Google Ads connection
    console.log('🔗 Testing Google Ads connection...');
    try {
      const GoogleAdsClient = require('../lib/google-ads');
      const googleAds = new GoogleAdsClient();
      await googleAds.initialize();
      const token = await googleAds.getAccessToken();
      console.log('✅ Google Ads connection successful');
      console.log(`   Customer ID: ${config.googleAds.customerId}`);
      console.log(`   MCC Customer ID: ${config.googleAds.mccCustomerId}`);
    } catch (error) {
      console.log('❌ Google Ads connection failed:', error.message);
      console.log('   Please check your Google Ads credentials');
    }
    console.log('');

    // Test Airtable connection
    console.log('🔗 Testing Airtable connection...');
    try {
      const AirtableClient = require('../lib/airtable');
      const airtable = new AirtableClient();
      const connected = await airtable.testConnection();
      if (connected) {
        console.log('✅ Airtable connection successful');
        console.log(`   Base ID: ${config.airtable.baseId}`);
      } else {
        console.log('❌ Airtable connection failed');
      }
    } catch (error) {
      console.log('❌ Airtable connection failed:', error.message);
      console.log('   Please check your Airtable credentials');
    }
    console.log('');

    // Check Claude API key
    console.log('🤖 Checking Claude API configuration...');
    if (config.claude.apiKey) {
      console.log('✅ Claude API key configured');
    } else {
      console.log('❌ Claude API key not configured');
    }
    console.log('');

    // Display configuration summary
    console.log('📊 Configuration Summary:');
    console.log('========================');
    console.log(`Environment: ${config.app.nodeEnv}`);
    console.log(`Port: ${config.app.port}`);
    console.log(`Log Level: ${config.app.logLevel}`);
    console.log(`Google Ads Customer ID: ${config.googleAds.customerId}`);
    console.log(`Google Ads MCC Customer ID: ${config.googleAds.mccCustomerId}`);
    console.log(`Airtable Base ID: ${config.airtable.baseId}`);
    console.log(`Claude API Key: ${config.claude.apiKey ? 'Configured' : 'Not configured'}`);
    console.log('');

    console.log('🎉 Setup completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run "npm start" to start the server');
    console.log('2. Test the API endpoints');
    console.log('3. Set up Vercel deployment');
    console.log('4. Configure cron jobs for automation');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setup();
}

module.exports = setup;
