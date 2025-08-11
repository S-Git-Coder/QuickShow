// Configuration for Cashfree Payment Gateway
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Always use production mode for live payments
const isProduction = true;

// Sandbox credentials (for development) - no longer used
const sandboxConfig = {
    appId: process.env.CASHFREE_SANDBOX_APP_ID || process.env.CASHFREE_APP_ID,
    secretKey: process.env.CASHFREE_SANDBOX_SECRET_KEY || process.env.CASHFREE_SECRET_KEY,
    baseUrl: process.env.CASHFREE_SANDBOX_BASE_URL || 'https://sandbox.cashfree.com/pg'
};

// DO NOT truncate credentials - use them as is
// Credentials need to be exact for authentication to work

// Production credentials (for live payments)
const productionConfig = {
    appId: process.env.CASHFREE_PRODUCTION_APP_ID || process.env.CASHFREE_APP_ID,
    secretKey: process.env.CASHFREE_PRODUCTION_SECRET_KEY || process.env.CASHFREE_SECRET_KEY,
    baseUrl: process.env.CASHFREE_PRODUCTION_BASE_URL || process.env.CASHFREE_BASE_URL || 'https://api.cashfree.com/pg'
};

// Normalize production credentials if needed
// Do not truncate production credentials as they need to be exact
// Only remove any trailing whitespace
if (productionConfig.appId) {
    productionConfig.appId = productionConfig.appId.trim();
}

if (productionConfig.secretKey) {
    productionConfig.secretKey = productionConfig.secretKey.trim();
}

// Always use production configuration
const cashfreeConfig = { ...productionConfig, webhookSecret: process.env.CASHFREE_WEBHOOK_SECRET || null };

// Validate and normalize the configuration
if (cashfreeConfig.appId) {
    cashfreeConfig.appId = cashfreeConfig.appId.trim();
}

if (cashfreeConfig.secretKey) {
    cashfreeConfig.secretKey = cashfreeConfig.secretKey.trim();
}

// Ensure the baseUrl is correct for the API version we're using
if (!cashfreeConfig.baseUrl.endsWith('/pg')) {
    cashfreeConfig.baseUrl = cashfreeConfig.baseUrl.endsWith('/')
        ? `${cashfreeConfig.baseUrl}pg`
        : `${cashfreeConfig.baseUrl}/pg`;
}


export default cashfreeConfig;