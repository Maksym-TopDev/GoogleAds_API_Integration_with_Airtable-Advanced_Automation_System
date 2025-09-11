const { config } = require('../config/environment');
const GoogleAdsClient = require('../lib/google-ads');
const { googleAds: logger } = require('../lib/logger');

async function testDataExtraction() {
  console.log('🔍 Testing Google Ads Data Extraction');
  console.log('=====================================\n');

  const googleAds = new GoogleAdsClient();
  
  try {
    // Initialize the client
    await googleAds.initialize();
    console.log('✅ Google Ads client initialized\n');

    // Test data extraction for the last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    
    const dateRange = {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    };

    console.log(`📅 Date Range: ${dateRange.start} to ${dateRange.end}\n`);

    // Test 1: Pull Campaign Data
    console.log('1️⃣ Testing Campaign Data Extraction...');
    try {
      const campaigns = await googleAds.pullCampaignData(config.googleAds.customerId, dateRange);
      console.log(`✅ Found ${campaigns.length} campaigns`);
      
      if (campaigns.length > 0) {
        console.log('\n📊 Sample Campaign Data:');
        console.log('========================');
        campaigns.slice(0, 3).forEach((campaign, index) => {
          console.log(`\nCampaign ${index + 1}:`);
          console.log(`  ID: ${campaign.id}`);
          console.log(`  Name: ${campaign.name}`);
          console.log(`  Status: ${campaign.status}`);
          console.log(`  Channel: ${campaign.channelType}`);
          console.log(`  Impressions: ${campaign.impressions.toLocaleString()}`);
          console.log(`  Clicks: ${campaign.clicks.toLocaleString()}`);
          console.log(`  CTR: ${(campaign.ctr * 100).toFixed(2)}%`);
          console.log(`  Cost: $${campaign.cost.toFixed(2)}`);
          console.log(`  Conversions: ${campaign.conversions}`);
          console.log(`  Conversion Rate: ${(campaign.conversionRate * 100).toFixed(2)}%`);
          console.log(`  CPA: $${campaign.cpa.toFixed(2)}`);
          console.log(`  ROAS: ${campaign.roas.toFixed(2)}`);
        });
      } else {
        console.log('ℹ️  No campaigns found for the date range');
      }
    } catch (error) {
      console.log(`❌ Campaign data extraction failed: ${error.message}`);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Pull Ad Group Data (if campaigns exist)
    console.log('2️⃣ Testing Ad Group Data Extraction...');
    try {
      const campaigns = await googleAds.pullCampaignData(config.googleAds.customerId, dateRange);
      
      if (campaigns.length > 0) {
        const firstCampaignId = campaigns[0].id;
        console.log(`📊 Pulling ad groups for campaign: ${firstCampaignId}`);
        
        const adGroups = await googleAds.pullAdGroupData(config.googleAds.customerId, firstCampaignId, dateRange);
        console.log(`✅ Found ${adGroups.length} ad groups`);
        
        if (adGroups.length > 0) {
          console.log('\n📊 Sample Ad Group Data:');
          console.log('=========================');
          adGroups.slice(0, 3).forEach((adGroup, index) => {
            console.log(`\nAd Group ${index + 1}:`);
            console.log(`  ID: ${adGroup.id}`);
            console.log(`  Name: ${adGroup.name}`);
            console.log(`  Status: ${adGroup.status}`);
            console.log(`  Campaign: ${adGroup.campaignName}`);
            console.log(`  Impressions: ${adGroup.impressions.toLocaleString()}`);
            console.log(`  Clicks: ${adGroup.clicks.toLocaleString()}`);
            console.log(`  CTR: ${(adGroup.ctr * 100).toFixed(2)}%`);
            console.log(`  Cost: $${adGroup.cost.toFixed(2)}`);
            console.log(`  Conversions: ${adGroup.conversions}`);
            console.log(`  Conversion Rate: ${(adGroup.conversionRate * 100).toFixed(2)}%`);
            console.log(`  CPA: $${adGroup.cpa.toFixed(2)}`);
            console.log(`  ROAS: ${adGroup.roas.toFixed(2)}`);
          });
        } else {
          console.log('ℹ️  No ad groups found for this campaign');
        }
      } else {
        console.log('ℹ️  No campaigns available to test ad groups');
      }
    } catch (error) {
      console.log(`❌ Ad group data extraction failed: ${error.message}`);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Pull Keyword Data (if ad groups exist)
    console.log('3️⃣ Testing Keyword Data Extraction...');
    try {
      const campaigns = await googleAds.pullCampaignData(config.googleAds.customerId, dateRange);
      
      if (campaigns.length > 0) {
        const firstCampaignId = campaigns[0].id;
        const adGroups = await googleAds.pullAdGroupData(config.googleAds.customerId, firstCampaignId, dateRange);
        
        if (adGroups.length > 0) {
          const firstAdGroupId = adGroups[0].id;
          console.log(`📊 Pulling keywords for ad group: ${firstAdGroupId}`);
          
          const keywords = await googleAds.pullKeywordData(config.googleAds.customerId, firstAdGroupId, dateRange);
          console.log(`✅ Found ${keywords.length} keywords`);
          
          if (keywords.length > 0) {
            console.log('\n📊 Sample Keyword Data:');
            console.log('========================');
            keywords.slice(0, 5).forEach((keyword, index) => {
              console.log(`\nKeyword ${index + 1}:`);
              console.log(`  ID: ${keyword.id}`);
              console.log(`  Text: ${keyword.text}`);
              console.log(`  Match Type: ${keyword.matchType}`);
              console.log(`  Status: ${keyword.status}`);
              console.log(`  Ad Group: ${keyword.adGroupName}`);
              console.log(`  Impressions: ${keyword.impressions.toLocaleString()}`);
              console.log(`  Clicks: ${keyword.clicks.toLocaleString()}`);
              console.log(`  CTR: ${(keyword.ctr * 100).toFixed(2)}%`);
              console.log(`  Cost: $${keyword.cost.toFixed(2)}`);
              console.log(`  Quality Score: ${keyword.qualityScore}`);
              console.log(`  Conversions: ${keyword.conversions}`);
              console.log(`  Conversion Rate: ${(keyword.conversionRate * 100).toFixed(2)}%`);
              console.log(`  CPA: $${keyword.cpa.toFixed(2)}`);
              console.log(`  ROAS: ${keyword.roas.toFixed(2)}`);
            });
          } else {
            console.log('ℹ️  No keywords found for this ad group');
          }
        } else {
          console.log('ℹ️  No ad groups available to test keywords');
        }
      } else {
        console.log('ℹ️  No campaigns available to test keywords');
      }
    } catch (error) {
      console.log(`❌ Keyword data extraction failed: ${error.message}`);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Pull Ad Data (if ad groups exist)
    console.log('4️⃣ Testing Ad Data Extraction...');
    try {
      const campaigns = await googleAds.pullCampaignData(config.googleAds.customerId, dateRange);
      
      if (campaigns.length > 0) {
        const firstCampaignId = campaigns[0].id;
        const adGroups = await googleAds.pullAdGroupData(config.googleAds.customerId, firstCampaignId, dateRange);
        
        if (adGroups.length > 0) {
          const firstAdGroupId = adGroups[0].id;
          console.log(`📊 Pulling ads for ad group: ${firstAdGroupId}`);
          
          const ads = await googleAds.pullAdData(config.googleAds.customerId, firstAdGroupId, dateRange);
          console.log(`✅ Found ${ads.length} ads`);
          
          if (ads.length > 0) {
            console.log('\n📊 Sample Ad Data:');
            console.log('==================');
            ads.slice(0, 3).forEach((ad, index) => {
              console.log(`\nAd ${index + 1}:`);
              console.log(`  ID: ${ad.id}`);
              console.log(`  Ad Group: ${ad.adGroupName}`);
              console.log(`  Campaign: ${ad.campaignName}`);
              console.log(`  Impressions: ${ad.impressions.toLocaleString()}`);
              console.log(`  Clicks: ${ad.clicks.toLocaleString()}`);
              console.log(`  CTR: ${(ad.ctr * 100).toFixed(2)}%`);
              console.log(`  Cost: $${ad.cost.toFixed(2)}`);
              console.log(`  Conversions: ${ad.conversions}`);
              console.log(`  Conversion Rate: ${(ad.conversionRate * 100).toFixed(2)}%`);
              console.log(`  CPA: $${ad.cpa.toFixed(2)}`);
              console.log(`  ROAS: ${ad.roas.toFixed(2)}`);
              
              // Parse and display headlines/descriptions
              try {
                const headlines = JSON.parse(ad.headlines);
                const descriptions = JSON.parse(ad.descriptions);
                console.log(`  Headlines: ${headlines.map(h => h.text).join(', ')}`);
                console.log(`  Descriptions: ${descriptions.map(d => d.text).join(', ')}`);
              } catch (e) {
                console.log(`  Headlines: ${ad.headlines}`);
                console.log(`  Descriptions: ${ad.descriptions}`);
              }
            });
          } else {
            console.log('ℹ️  No ads found for this ad group');
          }
        } else {
          console.log('ℹ️  No ad groups available to test ads');
        }
      } else {
        console.log('ℹ️  No campaigns available to test ads');
      }
    } catch (error) {
      console.log(`❌ Ad data extraction failed: ${error.message}`);
    }

    console.log('\n' + '='.repeat(50) + '\n');
    console.log('🎉 Data Extraction Test Complete!');
    console.log('==================================');
    console.log('✅ All data extraction methods tested');
    console.log('📊 Check the results above for detailed information');
    console.log('🔍 If you see "No data found", try expanding the date range');

  } catch (error) {
    console.error('❌ Data extraction test failed:', error);
  }
}

// Run the test if called directly
if (require.main === module) {
  testDataExtraction();
}

module.exports = testDataExtraction;
