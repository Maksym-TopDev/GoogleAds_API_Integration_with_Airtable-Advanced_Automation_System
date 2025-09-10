const GoogleAdsClient = require('../lib/google-ads');

describe('GoogleAdsClient transform methods', () => {
  let client;
  beforeAll(() => {
    client = new GoogleAdsClient();
  });

  test('transformCampaignData maps fields correctly', () => {
    const input = [{
      campaign: {
        id: '123',
        name: 'Test Campaign',
        status: 'ENABLED',
        advertisingChannelType: 'SEARCH',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      },
      metrics: {
        impressions: '1000',
        clicks: '100',
        ctr: '0.10',
        costMicros: '25000000',
        conversions: '10',
        conversionRate: '0.10',
        costPerConversion: '2500000',
        valuePerConversion: '5.5'
      }
    }];

    const result = client.transformCampaignData(input);
    expect(result[0]).toMatchObject({
      id: '123',
      name: 'Test Campaign',
      status: 'ENABLED',
      channelType: 'SEARCH',
      impressions: 1000,
      clicks: 100,
      ctr: 0.10,
      cost: 25,
      conversions: 10,
      conversionRate: 0.10,
      cpa: 2.5,
      roas: 5.5
    });
  });

  test('transformAdGroupData maps fields correctly', () => {
    const input = [{
      adGroup: { id: '456', name: 'AG', status: 'ENABLED' },
      campaign: { id: '123', name: 'Test Campaign' },
      metrics: { impressions: '50', clicks: '5', ctr: '0.1', costMicros: '1000000', conversions: '1', conversionRate: '0.2', costPerConversion: '1000000', valuePerConversion: '3.4' }
    }];

    const result = client.transformAdGroupData(input);
    expect(result[0]).toMatchObject({
      id: '456',
      campaignId: '123',
      impressions: 50,
      clicks: 5,
      cost: 1,
      conversions: 1,
      cpa: 1,
      roas: 3.4
    });
  });

  test('transformKeywordData maps fields correctly', () => {
    const input = [{
      adGroupCriterion: { criterionId: '789', keyword: { text: 'kw', matchType: 'EXACT' }, status: 'ENABLED' },
      adGroup: { id: '456', name: 'AG' },
      campaign: { id: '123', name: 'Test Campaign' },
      metrics: { impressions: '10', clicks: '1', ctr: '0.1', costMicros: '200000', conversions: '0.2', conversionRate: '0.2', costPerConversion: '200000', valuePerConversion: '1.1', qualityScore: '8' }
    }];

    const result = client.transformKeywordData(input);
    expect(result[0]).toMatchObject({
      id: '789',
      text: 'kw',
      matchType: 'EXACT',
      qualityScore: 8,
      cost: 0.2
    });
  });

  test('transformAdData maps fields correctly', () => {
    const input = [{
      adGroupAd: { ad: { id: '111', responsiveSearchAd: { headlines: [{ text: 'H1'}], descriptions: [{ text: 'D1'}], path1: 'p1', path2: 'p2' }, finalUrls: ['https://x.com'] } },
      adGroup: { id: '456', name: 'AG' },
      campaign: { id: '123', name: 'Test Campaign' },
      metrics: { impressions: '10', clicks: '1', ctr: '0.1', costMicros: '200000', conversions: '0.2', conversionRate: '0.2', costPerConversion: '200000', valuePerConversion: '1.1' }
    }];

    const result = client.transformAdData(input);
    expect(result[0]).toMatchObject({
      id: '111',
      adGroupId: '456',
      campaignId: '123',
      cost: 0.2
    });
  });
});
