require('dotenv').config();

const config = {
  googleAds: {
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    clientId: process.env.GOOGLE_ADS_CLIENT_ID,
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    customerId: process.env.GOOGLE_ADS_CUSTOMER_ID,
    mccCustomerId: process.env.GOOGLE_ADS_MCC_CUSTOMER_ID,
    rateLimit: parseInt(process.env.GOOGLE_ADS_RATE_LIMIT) || 10000
  },
  airtable: {
    apiKey: process.env.AIRTABLE_API_KEY,
    baseId: process.env.AIRTABLE_BASE_ID,
    rateLimit: parseInt(process.env.AIRTABLE_RATE_LIMIT) || 5
  },
  claude: {
    apiKey: process.env.ANTHROPIC_API_KEY
  },
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 3000,
    logLevel: process.env.LOG_LEVEL || 'info'
  },
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    notificationEmails: process.env.NOTIFICATION_EMAILS?.split(',') || []
  },
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL
  },
  database: {
    url: process.env.DATABASE_URL || 'sqlite:./data/automation.db'
  }
};

// Validation function
function validateConfig() {
  const required = [
    'GOOGLE_ADS_DEVELOPER_TOKEN',
    'GOOGLE_ADS_CLIENT_ID',
    'GOOGLE_ADS_CLIENT_SECRET',
    'AIRTABLE_API_KEY',
    'AIRTABLE_BASE_ID',
    'ANTHROPIC_API_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return true;
}

module.exports = {
  config,
  validateConfig
};
