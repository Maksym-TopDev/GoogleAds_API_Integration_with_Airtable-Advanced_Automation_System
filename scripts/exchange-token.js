const axios = require('axios');
const fs = require('fs');
const { config } = require('../config/environment');

async function exchangeToken(authorizationCode) {
  try {
    console.log('🔄 Exchanging authorization code for refresh token...\n');

    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: config.googleAds.clientId,
      client_secret: config.googleAds.clientSecret,
      code: authorizationCode,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:3000/oauth/callback'
    });

    const { access_token, refresh_token, expires_in } = response.data;

    console.log('✅ Token exchange successful!');
    console.log(`Access Token: ${access_token.substring(0, 20)}...`);
    console.log(`Refresh Token: ${refresh_token}`);
    console.log(`Expires In: ${expires_in} seconds`);
    console.log('');

    // Update .env file
    const envPath = '.env';
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent = envContent.replace(
      'GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token',
      `GOOGLE_ADS_REFRESH_TOKEN=${refresh_token}`
    );
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ .env file updated with refresh token');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npm run setup');
    console.log('2. Run: npm run test-connection');
    console.log('3. Run: npm start');

  } catch (error) {
    console.error('❌ Token exchange failed:', error.response?.data || error.message);
    console.log('');
    console.log('Make sure:');
    console.log('1. The authorization code is correct');
    console.log('2. The redirect URI matches exactly');
    console.log('3. The OAuth consent screen is configured');
  }
}

// Get authorization code from command line arguments
const authCode = process.argv[2];

if (!authCode) {
  console.log('Usage: node scripts/exchange-token.js <authorization_code>');
  console.log('');
  console.log('First, run: node scripts/refresh-token.js');
  process.exit(1);
}

exchangeToken(authCode);
