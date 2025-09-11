const { OAuth2Client } = require('google-auth-library');
const { config } = require('../config/environment');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function getNewRefreshToken() {
  console.log('🔑 Get New Google Ads Refresh Token');
  console.log('===================================\n');

  console.log('📊 Current Configuration:');
  console.log(`  Client ID: ${config.googleAds.clientId}`);
  console.log(`  Client Secret: ${config.googleAds.clientSecret ? 'Set' : 'Not Set'}`);
  console.log(`  Current Refresh Token: ${config.googleAds.refreshToken ? 'Set' : 'Not Set'}\n`);

  const oauth2Client = new OAuth2Client(
    config.googleAds.clientId,
    config.googleAds.clientSecret,
    'http://localhost:3000/oauth/callback'
  );

  // Generate the authorization URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/adwords'],
    prompt: 'consent'
  });

  console.log('🔗 Step 1: Open this URL in your browser:');
  console.log('==========================================');
  console.log(authUrl);
  console.log('\n');

  console.log('📝 Step 2: After authorizing, you\'ll be redirected to:');
  console.log('http://localhost:3000/oauth/callback?code=AUTHORIZATION_CODE');
  console.log('\n');

  console.log('📋 Step 3: Copy the authorization code from the URL');
  console.log('(The part after "code=" and before any "&" symbol)');
  console.log('\n');

  rl.question('Enter the authorization code: ', async (authCode) => {
    try {
      console.log('\n🔄 Exchanging authorization code for refresh token...');
      
      const { tokens } = await oauth2Client.getToken(authCode);
      
      console.log('✅ Successfully obtained tokens!');
      console.log('\n📊 New Tokens:');
      console.log(`  Access Token: ${tokens.access_token ? 'Set' : 'Not Set'}`);
      console.log(`  Refresh Token: ${tokens.refresh_token ? 'Set' : 'Not Set'}`);
      console.log(`  Expiry: ${tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : 'Not Set'}`);
      
      if (tokens.refresh_token) {
        console.log('\n🔧 Step 4: Update your .env file');
        console.log('================================');
        console.log('Replace this line in your .env file:');
        console.log(`GOOGLE_ADS_REFRESH_TOKEN=${config.googleAds.refreshToken}`);
        console.log('\nWith this line:');
        console.log(`GOOGLE_ADS_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log('\nThen run: npm run test-data');
      } else {
        console.log('\n⚠️  No refresh token received. This might mean:');
        console.log('1. You already have a valid refresh token');
        console.log('2. The OAuth app is not configured for offline access');
        console.log('3. You need to revoke existing tokens first');
      }
      
    } catch (error) {
      console.error('\n❌ Error exchanging authorization code:');
      console.error('  Message:', error.message);
      
      if (error.message.includes('invalid_grant')) {
        console.log('\n🔧 This usually means:');
        console.log('1. The authorization code has expired (try again)');
        console.log('2. The authorization code was already used');
        console.log('3. The OAuth credentials don\'t match');
      }
    }
    
    rl.close();
  });
}

// Run the script
getNewRefreshToken();
