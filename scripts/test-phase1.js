const axios = require('axios');
const { config } = require('../config/environment');
const { logger } = require('../lib/logger');

const BASE_URL = 'http://localhost:3000';

async function testPhase1() {
  console.log('🧪 Phase 1 Testing Suite');
  console.log('========================\n');

  const results = {
    server: false,
    health: false,
    connections: false,
    dataPull: false,
    airtable: false
  };

  try {
    // Test 1: Server Health
    console.log('1️⃣ Testing Server Health...');
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      if (response.status === 200) {
        results.server = true;
        console.log('   ✅ Server is running');
        console.log(`   📊 Status: ${response.data.status}`);
        console.log(`   🌍 Environment: ${response.data.environment}`);
      }
    } catch (error) {
      console.log('   ❌ Server health check failed:', error.message);
    }
    console.log('');

    // Test 2: System Health
    console.log('2️⃣ Testing System Health...');
    try {
      const response = await axios.get(`${BASE_URL}/api/system/health`);
      if (response.status === 200) {
        results.health = true;
        console.log('   ✅ System health check passed');
        console.log(`   📊 Overall Status: ${response.data.status}`);
        
        // Check individual services
        Object.entries(response.data.services).forEach(([service, status]) => {
          const icon = status.status === 'connected' || status.status === 'configured' ? '✅' : '❌';
          console.log(`   ${icon} ${service}: ${status.status}`);
        });
      }
    } catch (error) {
      console.log('   ❌ System health check failed:', error.message);
    }
    console.log('');

    // Test 3: Connection Test
    console.log('3️⃣ Testing API Connections...');
    try {
      const response = await axios.get(`${BASE_URL}/api/system/test-connections`);
      if (response.status === 200) {
        results.connections = true;
        console.log('   ✅ Connection test passed');
        console.log(`   📊 Google Ads: ${response.data.results.googleAds ? '✅' : '❌'}`);
        console.log(`   📊 Airtable: ${response.data.results.airtable ? '✅' : '❌'}`);
      }
    } catch (error) {
      console.log('   ❌ Connection test failed:', error.message);
    }
    console.log('');

    // Test 4: Airtable Integration
    console.log('4️⃣ Testing Airtable Integration...');
    try {
      const AirtableClient = require('../lib/airtable');
      const airtable = new AirtableClient();
      const connected = await airtable.testConnection();
      
      if (connected) {
        results.airtable = true;
        console.log('   ✅ Airtable connection successful');
        console.log(`   📊 Base ID: ${config.airtable.baseId}`);
        
        // Test table access
        try {
          const campaigns = await airtable.base('Campaigns').select({ maxRecords: 1 }).all();
          console.log('   ✅ Campaigns table accessible');
        } catch (error) {
          console.log('   ⚠️  Campaigns table access issue:', error.message);
        }
      } else {
        console.log('   ❌ Airtable connection failed');
      }
    } catch (error) {
      console.log('   ❌ Airtable test failed:', error.message);
    }
    console.log('');

    // Test 5: Data Pull (Dry Run)
    console.log('5️⃣ Testing Data Pull Functionality...');
    try {
      const testData = {
        customerIds: [config.googleAds.customerId],
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-01'
        }
      };

      console.log('   📊 Test parameters:', testData);
      
      const response = await axios.post(`${BASE_URL}/api/data/pull-performance`, testData, {
        timeout: 30000 // 30 second timeout
      });
      
      if (response.status === 200) {
        results.dataPull = true;
        console.log('   ✅ Data pull test successful');
        console.log(`   📊 Results: ${JSON.stringify(response.data.results, null, 2)}`);
      }
    } catch (error) {
      console.log('   ❌ Data pull test failed:', error.message);
      if (error.response) {
        console.log('   📊 Error details:', error.response.data);
      }
    }
    console.log('');

    // Test Summary
    console.log('📊 Phase 1 Test Summary');
    console.log('========================');
    console.log(`Server Health: ${results.server ? '✅' : '❌'}`);
    console.log(`System Health: ${results.health ? '✅' : '❌'}`);
    console.log(`API Connections: ${results.connections ? '✅' : '❌'}`);
    console.log(`Airtable Integration: ${results.airtable ? '✅' : '❌'}`);
    console.log(`Data Pull: ${results.dataPull ? '✅' : '❌'}`);
    console.log('');

    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`🎯 Tests Passed: ${passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
      console.log('🎉 Phase 1 is COMPLETE and ready for production!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Deploy to Vercel: npm run deploy');
      console.log('2. Set up cron jobs in Vercel dashboard');
      console.log('3. Monitor logs and performance');
      console.log('4. Ready for Phase 2 development');
    } else {
      console.log('⚠️  Some tests failed. Please check the issues above.');
      console.log('');
      console.log('Common fixes:');
      console.log('- Ensure Google Ads refresh token is valid');
      console.log('- Check Airtable API key and base ID');
      console.log('- Verify all environment variables are set');
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run tests if called directly
if (require.main === module) {
  testPhase1();
}

module.exports = testPhase1;
