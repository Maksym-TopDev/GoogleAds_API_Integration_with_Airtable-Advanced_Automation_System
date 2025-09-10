# Google Ads Airtable Automation System

A serverless Node.js application that automates Google Ads data pulling, performance analysis, and ad generation using Airtable as the data management platform.

## 🚀 Features

- **Daily Data Sync**: Automatically pulls campaign, ad group, keyword, and ad performance data from Google Ads
- **Airtable Integration**: Stores and manages data in a relational database structure
- **Performance Analysis**: Calculates KPIs and performance scores
- **AI-Powered Ad Generation**: Uses Claude AI to generate new ads based on top performers
- **Automated Upload**: Queues and uploads new ads back to Google Ads
- **Serverless Architecture**: Built for Vercel with automatic scaling

## 📋 Prerequisites

- Node.js 18+ 
- Google Ads API access
- Airtable account
- Claude API access
- Vercel account (for deployment)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd google-ads-airtable-automation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your credentials
   ```

4. **Run setup**
   ```bash
   npm run setup
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Google Ads API Configuration
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
GOOGLE_ADS_CUSTOMER_ID=your_customer_id
GOOGLE_ADS_MCC_CUSTOMER_ID=your_mcc_customer_id

# Airtable Configuration
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id

# Claude/LLM Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key

# Application Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
```

### Airtable Setup

Follow the `AIRTABLE_SETUP.md` guide to set up your Airtable base with the required tables and fields.

## 🚀 Usage

### Local Development

1. **Start the server**
   ```bash
   npm start
   ```

2. **Test connections**
   ```bash
   npm run test-connection
   ```

3. **Manual data pull**
   ```bash
   curl -X POST http://localhost:3000/api/data/pull-performance \
     -H "Content-Type: application/json" \
     -d '{
       "customerIds": ["203-230-4101"],
       "dateRange": {
         "start": "2024-01-01",
         "end": "2024-01-01"
       }
     }'
   ```

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard**

4. **Configure cron jobs** (automatically set up via `vercel.json`)

## 📊 API Endpoints

### Data Management
- `POST /api/data/pull-performance` - Pull performance data from Google Ads
- `GET /api/data/status` - Get data status and counts

### System
- `GET /api/system/health` - System health check
- `GET /api/system/test-connections` - Test API connections

### Analysis (Phase 2)
- `POST /api/analysis/performance` - Run performance analysis
- `POST /api/analysis/scoring` - Calculate performance scores

### Ads (Phase 3)
- `POST /api/ads/generate` - Generate new ads with AI
- `POST /api/ads/upload` - Upload ads to Google Ads

## 🔄 Automation

The system includes automated cron jobs:

- **Daily Sync**: Runs at 9:00 AM UTC daily
- **Performance Analysis**: Runs at 10:00 AM UTC daily  
- **Ad Upload**: Runs every 6 hours

## 📈 Project Phases

### Phase 1: Data Integration (Current)
- ✅ Google Ads API integration
- ✅ Airtable integration
- ✅ Daily data synchronization
- ✅ Basic error handling

### Phase 2: Performance Analysis
- 🔄 Performance scoring algorithms
- 🔄 Threshold detection
- 🔄 KPI calculations
- 🔄 Automated analysis

### Phase 3: AI Ad Generation
- 🔄 Claude AI integration
- 🔄 Ad generation system
- 🔄 Google Ads upload
- 🔄 Complete automation

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Test connections
npm run test-connection
```

## 📝 Logging

Logs are stored in the `logs/` directory:
- `error.log` - Error messages only
- `combined.log` - All log messages

## 🚨 Troubleshooting

### Common Issues

1. **Google Ads API errors**
   - Check your developer token and credentials
   - Verify customer IDs are correct
   - Ensure OAuth tokens are valid

2. **Airtable connection issues**
   - Verify API key and base ID
   - Check base permissions
   - Ensure tables exist with correct field names

3. **Rate limiting**
   - The system includes built-in rate limiting
   - Check logs for rate limit warnings

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug npm start
```

## 📞 Support

For issues and questions:
1. Check the logs in `logs/` directory
2. Run `npm run test-connection` to verify setup
3. Check the API health endpoint
4. Review the troubleshooting guide

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

**Built with ❤️ for Google Ads automation**
