// Configuration for Cashfree Payment Gateway
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Always use production mode for live payments
const isProduction = true;

// Log environment and configuration status
console.log('Cashfree Configuration:');
console.log('- Environment:', process.env.NODE_ENV);
console.log('- Force Production: true');
console.log('- Using Production Config:', isProduction);

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

// Log the actual credentials being used (without exposing full values)
console.log('Production Credentials Check:');
console.log('- App ID:', productionConfig.appId ? `${productionConfig.appId.substring(0, 6)}...${productionConfig.appId.substring(productionConfig.appId.length - 4)}` : 'Not set');
console.log('- Secret Key Length:', productionConfig.secretKey ? productionConfig.secretKey.length : 'Not set');
console.log('- Base URL:', productionConfig.baseUrl);

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
const cashfreeConfig = productionConfig;

export default cashfreeConfig;