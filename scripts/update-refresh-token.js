const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔑 Update Google Ads Refresh Token');
console.log('==================================\n');

rl.question('Enter your Google Ads refresh token: ', (refreshToken) => {
  if (!refreshToken || refreshToken.trim() === '') {
    console.log('❌ No refresh token provided');
    rl.close();
    return;
  }

  try {
    // Read current .env file
    let envContent = fs.readFileSync('.env', 'utf8');
    
    // Update the refresh token
    envContent = envContent.replace(
      'GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token',
      `GOOGLE_ADS_REFRESH_TOKEN=${refreshToken.trim()}`
    );
    
    // Write back to .env file
    fs.writeFileSync('.env', envContent);
    
    console.log('✅ Refresh token updated successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npm run test-connection');
    console.log('2. Run: npm run setup');
    console.log('3. Test the data pull functionality');
    
  } catch (error) {
    console.error('❌ Failed to update refresh token:', error.message);
  }
  
  rl.close();
});
