const AirtableClient = require('../lib/airtable');

jest.mock('airtable', () => {
  return function AirtableMock() {
    return {
      base: () => {
        const api = () => ({
          create: jest.fn(async (records) => records),
          update: jest.fn(async (updates) => updates),
          select: () => ({ all: jest.fn(async () => []) })
        });
        api.create = jest.fn(async (records) => records);
        return api;
      }
    };
  };
});

describe('AirtableClient mapping', () => {
  let client;
  beforeAll(() => {
    process.env.AIRTABLE_API_KEY = 'x';
    process.env.AIRTABLE_BASE_ID = 'y';
    client = new AirtableClient();
  });

  test('createCampaigns maps fields', async () => {
    const data = [{
      id: '123', name: 'C', status: 'ENABLED', channelType: 'SEARCH',
      startDate: '2024-01-01', endDate: '2024-12-31', impressions: 1, clicks: 1,
      ctr: 0.1, cost: 1.2, conversions: 1, conversionRate: 0.1, cpa: 1.2, roas: 3.4, lastUpdated: 'now'
    }];
    const res = await client.createCampaigns(data);
    expect(res[0].fields['Campaign ID']).toBe('123');
    expect(res[0].fields['Cost']).toBe(1.2);
  });

  test('createAdGroups maps fields', async () => {
    const data = [{ id: '1', name: 'AG', status: 'ENABLED', campaignId: '123', campaignName: 'C', impressions: 1, clicks: 1, ctr: 0.1, cost: 1, conversions: 1, conversionRate: 0.1, cpa: 1, roas: 2, lastUpdated: 'now' }];
    const res = await client.createAdGroups(data);
    expect(res[0].fields['Ad Group ID']).toBe('1');
    expect(res[0].fields['Campaign ID']).toBe('123');
  });

  test('createKeywords maps fields', async () => {
    const data = [{ id: 'k1', text: 'kw', matchType: 'EXACT', status: 'ENABLED', adGroupId: '1', adGroupName: 'AG', campaignId: '123', campaignName: 'C', impressions: 1, clicks: 1, ctr: 0.1, cost: 1, conversions: 1, conversionRate: 0.1, cpa: 1, roas: 2, qualityScore: 7, lastUpdated: 'now' }];
    const res = await client.createKeywords(data);
    expect(res[0].fields['Keyword ID']).toBe('k1');
    expect(res[0].fields['Quality Score']).toBe(7);
  });

  test('createAds maps fields', async () => {
    const data = [{ id: 'a1', headlines: '[]', descriptions: '[]', path1: 'p1', path2: 'p2', finalUrls: '[]', adGroupId: '1', adGroupName: 'AG', campaignId: '123', campaignName: 'C', impressions: 1, clicks: 1, ctr: 0.1, cost: 1, conversions: 1, conversionRate: 0.1, cpa: 1, roas: 2, lastUpdated: 'now' }];
    const res = await client.createAds(data);
    expect(res[0].fields['Ad ID']).toBe('a1');
    expect(res[0].fields['Final URLs']).toBe('[]');
  });
});
