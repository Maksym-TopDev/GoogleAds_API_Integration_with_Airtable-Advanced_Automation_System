const Airtable = require('airtable');
const { config } = require('../config/environment');
const { airtable: logger } = require('./logger');

class AirtableClient {
  constructor() {
    this.base = new Airtable({
      apiKey: config.airtable.apiKey
    }).base(config.airtable.baseId);
    
    this.rateLimiter = {
      requests: 0,
      resetTime: Date.now() + 60000, // 1 minute
      maxRequests: config.airtable.rateLimit
    };
  }

  async checkRateLimit() {
    const now = Date.now();
    if (now > this.rateLimiter.resetTime) {
      this.rateLimiter.requests = 0;
      this.rateLimiter.resetTime = now + 60000;
    }

    if (this.rateLimiter.requests >= this.rateLimiter.maxRequests) {
      const waitTime = this.rateLimiter.resetTime - now;
      logger.warn(`Rate limit reached. Waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  async createCampaigns(campaigns) {
    await this.checkRateLimit();
    
    try {
      logger.info(`Creating ${campaigns.length} campaigns in Airtable`);
      
      const records = campaigns.map(campaign => ({
        fields: {
          'Campaign ID': campaign.id,
          'Campaign Name': campaign.name,
          'Status': campaign.status,
          'Channel Type': campaign.channelType,
          'Start Date': campaign.startDate,
          'End Date': campaign.endDate,
          'Impressions': campaign.impressions,
          'Clicks': campaign.clicks,
          'CTR': campaign.ctr,
          'Cost': campaign.cost,
          'Conversions': campaign.conversions,
          'Conversion Rate': campaign.conversionRate,
          'CPA': campaign.cpa,
          'ROAS': campaign.roas,
          'Last Updated': campaign.lastUpdated
        }
      }));

      const result = await this.base('Campaigns').create(records);
      this.rateLimiter.requests++;
      
      logger.info(`Successfully created ${result.length} campaigns`);
      return result;
    } catch (error) {
      logger.error('Failed to create campaigns:', error);
      throw error;
    }
  }

  async createAdGroups(adGroups) {
    await this.checkRateLimit();
    
    try {
      logger.info(`Creating ${adGroups.length} ad groups in Airtable`);
      
      const records = adGroups.map(adGroup => ({
        fields: {
          'Ad Group ID': adGroup.id,
          'Ad Group Name': adGroup.name,
          'Status': adGroup.status,
          'Campaign ID': adGroup.campaignId,
          'Campaign Name': adGroup.campaignName,
          'Impressions': adGroup.impressions,
          'Clicks': adGroup.clicks,
          'CTR': adGroup.ctr,
          'Cost': adGroup.cost,
          'Conversions': adGroup.conversions,
          'Conversion Rate': adGroup.conversionRate,
          'CPA': adGroup.cpa,
          'ROAS': adGroup.roas,
          'Last Updated': adGroup.lastUpdated
        }
      }));

      const result = await this.base('Ad Groups').create(records);
      this.rateLimiter.requests++;
      
      logger.info(`Successfully created ${result.length} ad groups`);
      return result;
    } catch (error) {
      logger.error('Failed to create ad groups:', error);
      throw error;
    }
  }

  async createKeywords(keywords) {
    await this.checkRateLimit();
    
    try {
      logger.info(`Creating ${keywords.length} keywords in Airtable`);
      
      const records = keywords.map(keyword => ({
        fields: {
          'Keyword ID': keyword.id,
          'Keyword Text': keyword.text,
          'Match Type': keyword.matchType,
          'Status': keyword.status,
          'Ad Group ID': keyword.adGroupId,
          'Ad Group Name': keyword.adGroupName,
          'Campaign ID': keyword.campaignId,
          'Campaign Name': keyword.campaignName,
          'Impressions': keyword.impressions,
          'Clicks': keyword.clicks,
          'CTR': keyword.ctr,
          'Cost': keyword.cost,
          'Conversions': keyword.conversions,
          'Conversion Rate': keyword.conversionRate,
          'CPA': keyword.cpa,
          'ROAS': keyword.roas,
          'Quality Score': keyword.qualityScore,
          'Last Updated': keyword.lastUpdated
        }
      }));

      const result = await this.base('Keywords').create(records);
      this.rateLimiter.requests++;
      
      logger.info(`Successfully created ${result.length} keywords`);
      return result;
    } catch (error) {
      logger.error('Failed to create keywords:', error);
      throw error;
    }
  }

  async createAds(ads) {
    await this.checkRateLimit();
    
    try {
      logger.info(`Creating ${ads.length} ads in Airtable`);
      
      const records = ads.map(ad => ({
        fields: {
          'Ad ID': ad.id,
          'Headlines': ad.headlines,
          'Descriptions': ad.descriptions,
          'Path1': ad.path1,
          'Path2': ad.path2,
          'Final URLs': ad.finalUrls,
          'Ad Group ID': ad.adGroupId,
          'Ad Group Name': ad.adGroupName,
          'Campaign ID': ad.campaignId,
          'Campaign Name': ad.campaignName,
          'Impressions': ad.impressions,
          'Clicks': ad.clicks,
          'CTR': ad.ctr,
          'Cost': ad.cost,
          'Conversions': ad.conversions,
          'Conversion Rate': ad.conversionRate,
          'CPA': ad.cpa,
          'ROAS': ad.roas,
          'Last Updated': ad.lastUpdated
        }
      }));

      const result = await this.base('Ads').create(records);
      this.rateLimiter.requests++;
      
      logger.info(`Successfully created ${result.length} ads`);
      return result;
    } catch (error) {
      logger.error('Failed to create ads:', error);
      throw error;
    }
  }

  async getHighPerformers(thresholds = {}) {
    await this.checkRateLimit();
    
    try {
      const { performanceScore = 8, ctr = 5, conversionRate = 7, roas = 4 } = thresholds;
      
      logger.info('Fetching high performers from Airtable', { thresholds });
      
      const records = await this.base('Campaigns')
        .select({
          filterByFormula: `AND(
            {Performance Score} >= ${performanceScore},
            {CTR} >= ${ctr},
            {Conversion Rate} >= ${conversionRate},
            {ROAS} >= ${roas},
            {Meets Thresholds} = TRUE()
          )`
        })
        .all();

      this.rateLimiter.requests++;
      
      const highPerformers = records.map(record => ({
        id: record.id,
        fields: record.fields
      }));
      
      logger.info(`Found ${highPerformers.length} high performers`);
      return highPerformers;
    } catch (error) {
      logger.error('Failed to get high performers:', error);
      throw error;
    }
  }

  async updatePerformanceScores(campaignScores) {
    await this.checkRateLimit();
    
    try {
      logger.info(`Updating performance scores for ${campaignScores.length} campaigns`);
      
      const updates = campaignScores.map(({ campaignId, performanceScore, priority, meetsThresholds }) => ({
        id: campaignId,
        fields: {
          'Performance Score': performanceScore,
          'Priority': priority,
          'Meets Thresholds': meetsThresholds,
          'Analysis Date': new Date().toISOString()
        }
      }));

      const result = await this.base('Campaigns').update(updates);
      this.rateLimiter.requests++;
      
      logger.info(`Successfully updated ${result.length} performance scores`);
      return result;
    } catch (error) {
      logger.error('Failed to update performance scores:', error);
      throw error;
    }
  }

  async createGeneratedAd(adData) {
    await this.checkRateLimit();
    
    try {
      logger.info('Creating generated ad in Airtable');
      
      const record = {
        fields: {
          'Top Ad Copy': adData.topAdCopy,
          'CTR': adData.ctr,
          'Conversion Rate': adData.conversionRate,
          'Cost per Conversion': adData.costPerConversion,
          'Performance Score': adData.performanceScore,
          'New Headline 1': adData.newHeadline1,
          'New Headline 2': adData.newHeadline2,
          'New Headline 3': adData.newHeadline3,
          'New Description 1': adData.newDescription1,
          'New Description 2': adData.newDescription2,
          'Keywords Used': JSON.stringify(adData.keywordsUsed),
          'Target Audience': adData.targetAudience,
          'Notes': adData.notes,
          'Status': adData.status || 'Generated',
          'Created At': new Date().toISOString()
        }
      };

      const result = await this.base('Ad Generator').create([record]);
      this.rateLimiter.requests++;
      
      logger.info('Successfully created generated ad');
      return result[0];
    } catch (error) {
      logger.error('Failed to create generated ad:', error);
      throw error;
    }
  }

  async addToUploadQueue(uploadData) {
    await this.checkRateLimit();
    
    try {
      logger.info('Adding ad to upload queue');
      
      const record = {
        fields: {
          'Campaign ID': uploadData.campaignId,
          'Ad Group ID': uploadData.adGroupId,
          'Headlines': JSON.stringify(uploadData.headlines),
          'Descriptions': JSON.stringify(uploadData.descriptions),
          'Final URL': uploadData.finalUrl,
          'Keywords': JSON.stringify(uploadData.keywords),
          'Status': 'Pending',
          'Created At': new Date().toISOString()
        }
      };

      const result = await this.base('Upload Queue').create([record]);
      this.rateLimiter.requests++;
      
      logger.info('Successfully added to upload queue');
      return result[0];
    } catch (error) {
      logger.error('Failed to add to upload queue:', error);
      throw error;
    }
  }

  async getUploadQueue(status = 'Pending') {
    await this.checkRateLimit();
    
    try {
      logger.info(`Fetching upload queue with status: ${status}`);
      
      const records = await this.base('Upload Queue')
        .select({
          filterByFormula: `{Status} = '${status}'`
        })
        .all();

      this.rateLimiter.requests++;
      
      const queue = records.map(record => ({
        id: record.id,
        fields: record.fields
      }));
      
      logger.info(`Found ${queue.length} items in upload queue`);
      return queue;
    } catch (error) {
      logger.error('Failed to get upload queue:', error);
      throw error;
    }
  }

  async updateUploadStatus(recordId, status, results = null) {
    await this.checkRateLimit();
    
    try {
      logger.info(`Updating upload status for record ${recordId} to ${status}`);
      
      const updateData = {
        id: recordId,
        fields: {
          'Status': status,
          'Updated At': new Date().toISOString()
        }
      };

      if (results) {
        updateData.fields['Upload Results'] = JSON.stringify(results);
      }

      const result = await this.base('Upload Queue').update([updateData]);
      this.rateLimiter.requests++;
      
      logger.info('Successfully updated upload status');
      return result[0];
    } catch (error) {
      logger.error('Failed to update upload status:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      logger.info('Testing Airtable connection...');
      
      const records = await this.base('Campaigns').select({
        maxRecords: 1
      }).all();
      
      this.rateLimiter.requests++;
      
      logger.info('Airtable connection successful');
      return true;
    } catch (error) {
      logger.error('Airtable connection failed:', error);
      return false;
    }
  }
}

module.exports = AirtableClient;
