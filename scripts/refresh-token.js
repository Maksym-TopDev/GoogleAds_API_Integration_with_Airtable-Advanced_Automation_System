const { GoogleAuth } = require('google-auth-library');
const { config } = require('../config/environment');
const { logger } = require('../lib/logger');

async function getRefreshToken() {
  try {
    console.log('🔑 Google Ads OAuth Token Setup');
    console.log('================================\n');

    console.log('To get your refresh token, follow these steps:');
    console.log('');
    console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
    console.log('2. Select your project');
    console.log('3. Go to APIs & Services > Credentials');
    console.log('4. Click on your OAuth 2.0 Client ID');
    console.log('5. Add this redirect URI: http://localhost:3000/oauth/callback');
    console.log('6. Save the changes');
    console.log('');
    console.log('7. Open this URL in your browser:');
    console.log('');
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${config.googleAds.clientId}&` +
      `redirect_uri=http://localhost:3000/oauth/callback&` +
      `response_type=code&` +
      `scope=https://www.googleapis.com/auth/adwords&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    console.log(authUrl);
    console.log('');
    console.log('8. Authorize the application');
    console.log('9. Copy the authorization code from the callback URL');
    console.log('10. Run: node scripts/exchange-token.js <authorization_code>');
    console.log('');
    console.log('Your current configuration:');
    console.log(`Client ID: ${config.googleAds.clientId}`);
    console.log(`Client Secret: ${config.googleAds.clientSecret}`);
    console.log(`Customer ID: ${config.googleAds.customerId}`);
    console.log(`MCC Customer ID: ${config.googleAds.mccCustomerId}`);

  } catch (error) {
    logger.error('Failed to generate auth URL:', error);
    console.error('❌ Error:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  getRefreshToken();
}

module.exports = getRefreshToken;
