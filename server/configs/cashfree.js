// Configuration for Cashfree Payment Gateway
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Determine if we're in production mode
// Force production mode for live payments
const isProduction = process.env.NODE_ENV === 'production' || process.env.CASHFREE_USE_PRODUCTION === 'true';

// Log environment and configuration status
console.log('Cashfree Configuration:');
console.log('- Environment:', process.env.NODE_ENV);
console.log('- Force Production:', process.env.CASHFREE_USE_PRODUCTION);
console.log('- Using Production Config:', isProduction);

// Sandbox credentials (for development)
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

// Export the appropriate configuration based on environment
const cashfreeConfig = isProduction ? productionConfig : sandboxConfig;

export default cashfreeConfig;