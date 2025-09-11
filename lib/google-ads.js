const { GoogleAdsApi } = require('google-ads-api');
const { config } = require('../config/environment');
const { googleAds: logger } = require('./logger');

class GoogleAdsClient {
  constructor() {
    this.client = null;
    this.initialized = false;
    this.rateLimiter = {
      requests: 0,
      resetTime: Date.now() + 86400000, // 24 hours
      maxRequests: config.googleAds.rateLimit
    };
  }

  async initialize() {
    try {
      logger.info('Initializing Google Ads client...');
      
      // Initialize Google Ads API client with OAuth credentials
      this.client = new GoogleAdsApi({
        developer_token: config.googleAds.developerToken,
        client_id: config.googleAds.clientId,
        client_secret: config.googleAds.clientSecret,
        refresh_token: config.googleAds.refreshToken,
        login_customer_id: config.googleAds.mccCustomerId
      });

      this.initialized = true;
      logger.info('Google Ads client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Google Ads client:', error);
      throw error;
    }
  }

  async getAccessToken() {
    // Not needed with google-ads-api library (handled internally)
    return true;
  }

  async checkRateLimit() {
    const now = Date.now();
    if (now > this.rateLimiter.resetTime) {
      this.rateLimiter.requests = 0;
      this.rateLimiter.resetTime = now + 86400000;
    }

    if (this.rateLimiter.requests >= this.rateLimiter.maxRequests) {
      const waitTime = this.rateLimiter.resetTime - now;
      logger.warn(`Rate limit reached. Waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  async pullCampaignData(customerId, dateRange) {
    await this.checkRateLimit();
    
    try {
      logger.info(`Pulling campaign data for customer ${customerId}`, { dateRange });
      
      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          campaign.start_date,
          campaign.end_date,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversion_rate,
          metrics.cost_per_conversion,
          metrics.value_per_conversion
        FROM campaign
        WHERE segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}'
        AND campaign.status = 'ENABLED'
      `;

      const customer = this.client.Customer(String(customerId));
      const response = await customer.query(query);

      this.rateLimiter.requests++;
      const campaigns = this.transformCampaignData(response);
      
      logger.info(`Pulled ${campaigns.length} campaigns`, { customerId });
      return campaigns;
    } catch (error) {
      logger.error('Failed to pull campaign data:', error);
      throw error;
    }
  }

  async pullAdGroupData(customerId, campaignId, dateRange) {
    await this.checkRateLimit();
    
    try {
      logger.info(`Pulling ad group data for campaign ${campaignId}`, { customerId, dateRange });
      
      const query = `
        SELECT 
          ad_group.id,
          ad_group.name,
          ad_group.status,
          campaign.id,
          campaign.name,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversion_rate,
          metrics.cost_per_conversion,
          metrics.value_per_conversion
        FROM ad_group
        WHERE segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}'
        AND ad_group.status = 'ENABLED'
        AND campaign.id = ${campaignId}
      `;

      const customer = this.client.Customer(String(customerId));
      const response = await customer.query(query);

      this.rateLimiter.requests++;
      const adGroups = this.transformAdGroupData(response);
      
      logger.info(`Pulled ${adGroups.length} ad groups`, { customerId, campaignId });
      return adGroups;
    } catch (error) {
      logger.error('Failed to pull ad group data:', error);
      throw error;
    }
  }

  async pullKeywordData(customerId, adGroupId, dateRange) {
    await this.checkRateLimit();
    
    try {
      logger.info(`Pulling keyword data for ad group ${adGroupId}`, { customerId, dateRange });
      
      const query = `
        SELECT 
          ad_group_criterion.criterion_id,
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          ad_group_criterion.status,
          ad_group.id,
          ad_group.name,
          campaign.id,
          campaign.name,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversion_rate,
          metrics.cost_per_conversion,
          metrics.value_per_conversion,
          metrics.quality_score
        FROM keyword_view
        WHERE segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}'
        AND ad_group_criterion.status = 'ENABLED'
        AND ad_group.id = ${adGroupId}
      `;

      const customer = this.client.Customer(String(customerId));
      const response = await customer.query(query);

      this.rateLimiter.requests++;
      const keywords = this.transformKeywordData(response);
      
      logger.info(`Pulled ${keywords.length} keywords`, { customerId, adGroupId });
      return keywords;
    } catch (error) {
      logger.error('Failed to pull keyword data:', error);
      throw error;
    }
  }

  async pullAdData(customerId, adGroupId, dateRange) {
    await this.checkRateLimit();
    
    try {
      logger.info(`Pulling ad data for ad group ${adGroupId}`, { customerId, dateRange });
      
      const query = `
        SELECT 
          ad_group_ad.ad.id,
          ad_group_ad.ad.responsive_search_ad.headlines,
          ad_group_ad.ad.responsive_search_ad.descriptions,
          ad_group_ad.ad.responsive_search_ad.path1,
          ad_group_ad.ad.responsive_search_ad.path2,
          ad_group_ad.ad.final_urls,
          ad_group.id,
          ad_group.name,
          campaign.id,
          campaign.name,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversion_rate,
          metrics.cost_per_conversion,
          metrics.value_per_conversion
        FROM ad_group_ad
        WHERE segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}'
        AND ad_group_ad.status = 'ENABLED'
        AND ad_group.id = ${adGroupId}
      `;

      const customer = this.client.Customer(String(customerId));
      const response = await customer.query(query);

      this.rateLimiter.requests++;
      const ads = this.transformAdData(response);
      
      logger.info(`Pulled ${ads.length} ads`, { customerId, adGroupId });
      return ads;
    } catch (error) {
      logger.error('Failed to pull ad data:', error);
      throw error;
    }
  }

  transformCampaignData(response) {
    return response.map(row => ({
      id: row.campaign?.id?.toString(),
      name: row.campaign?.name,
      status: row.campaign?.status,
      channelType: row.campaign?.advertisingChannelType,
      startDate: row.campaign?.startDate,
      endDate: row.campaign?.endDate,
      impressions: parseInt(row.metrics?.impressions) || 0,
      clicks: parseInt(row.metrics?.clicks) || 0,
      ctr: parseFloat(row.metrics?.ctr) || 0,
      cost: (parseInt(row.metrics?.costMicros) || 0) / 1000000,
      conversions: parseFloat(row.metrics?.conversions) || 0,
      conversionRate: parseFloat(row.metrics?.conversionRate) || 0,
      cpa: (parseInt(row.metrics?.costPerConversion) || 0) / 1000000,
      roas: parseFloat(row.metrics?.valuePerConversion) || 0,
      lastUpdated: new Date().toISOString()
    }));
  }

  transformAdGroupData(response) {
    return response.map(row => ({
      id: row.adGroup?.id?.toString(),
      name: row.adGroup?.name,
      status: row.adGroup?.status,
      campaignId: row.campaign?.id?.toString(),
      campaignName: row.campaign?.name,
      impressions: parseInt(row.metrics?.impressions) || 0,
      clicks: parseInt(row.metrics?.clicks) || 0,
      ctr: parseFloat(row.metrics?.ctr) || 0,
      cost: (parseInt(row.metrics?.costMicros) || 0) / 1000000,
      conversions: parseFloat(row.metrics?.conversions) || 0,
      conversionRate: parseFloat(row.metrics?.conversionRate) || 0,
      cpa: (parseInt(row.metrics?.costPerConversion) || 0) / 1000000,
      roas: parseFloat(row.metrics?.valuePerConversion) || 0,
      lastUpdated: new Date().toISOString()
    }));
  }

  transformKeywordData(response) {
    return response.map(row => ({
      id: row.adGroupCriterion?.criterionId?.toString(),
      text: row.adGroupCriterion?.keyword?.text,
      matchType: row.adGroupCriterion?.keyword?.matchType,
      status: row.adGroupCriterion?.status,
      adGroupId: row.adGroup?.id?.toString(),
      adGroupName: row.adGroup?.name,
      campaignId: row.campaign?.id?.toString(),
      campaignName: row.campaign?.name,
      impressions: parseInt(row.metrics?.impressions) || 0,
      clicks: parseInt(row.metrics?.clicks) || 0,
      ctr: parseFloat(row.metrics?.ctr) || 0,
      cost: (parseInt(row.metrics?.costMicros) || 0) / 1000000,
      conversions: parseFloat(row.metrics?.conversions) || 0,
      conversionRate: parseFloat(row.metrics?.conversionRate) || 0,
      cpa: (parseInt(row.metrics?.costPerConversion) || 0) / 1000000,
      roas: parseFloat(row.metrics?.valuePerConversion) || 0,
      qualityScore: parseInt(row.metrics?.qualityScore) || 0,
      lastUpdated: new Date().toISOString()
    }));
  }

  transformAdData(response) {
    return response.map(row => ({
      id: row.adGroupAd?.ad?.id?.toString(),
      headlines: JSON.stringify(row.adGroupAd?.ad?.responsiveSearchAd?.headlines || []),
      descriptions: JSON.stringify(row.adGroupAd?.ad?.responsiveSearchAd?.descriptions || []),
      path1: row.adGroupAd?.ad?.responsiveSearchAd?.path1,
      path2: row.adGroupAd?.ad?.responsiveSearchAd?.path2,
      finalUrls: JSON.stringify(row.adGroupAd?.ad?.finalUrls || []),
      adGroupId: row.adGroup?.id?.toString(),
      adGroupName: row.adGroup?.name,
      campaignId: row.campaign?.id?.toString(),
      campaignName: row.campaign?.name,
      impressions: parseInt(row.metrics?.impressions) || 0,
      clicks: parseInt(row.metrics?.clicks) || 0,
      ctr: parseFloat(row.metrics?.ctr) || 0,
      cost: (parseInt(row.metrics?.costMicros) || 0) / 1000000,
      conversions: parseFloat(row.metrics?.conversions) || 0,
      conversionRate: parseFloat(row.metrics?.conversionRate) || 0,
      cpa: (parseInt(row.metrics?.costPerConversion) || 0) / 1000000,
      roas: parseFloat(row.metrics?.valuePerConversion) || 0,
      lastUpdated: new Date().toISOString()
    }));
  }
}

module.exports = GoogleAdsClient;
