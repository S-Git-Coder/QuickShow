// Configuration for Cashfree Payment Gateway
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Determine environment based on .env variable
const isProduction = process.env.CASHFREE_USE_PRODUCTION === 'true';

console.log('Cashfree Configuration:');
console.log('- Environment Mode:', isProduction ? 'PRODUCTION' : 'SANDBOX/TEST');

// Sandbox/Test credentials
const sandboxConfig = {
    appId: process.env.CASHFREE_APP_ID,
    secretKey: process.env.CASHFREE_SECRET_KEY,
    baseUrl: process.env.CASHFREE_BASE_URL || 'https://sandbox.cashfree.com/pg'
};

// Production credentials (for live payments)
const productionConfig = {
    appId: process.env.CASHFREE_APP_ID,
    secretKey: process.env.CASHFREE_SECRET_KEY,
    baseUrl: process.env.CASHFREE_BASE_URL || 'https://api.cashfree.com/pg'
};

// Select configuration based on environment
const cashfreeConfig = isProduction ? productionConfig : sandboxConfig;

// Validate and trim credentials
if (cashfreeConfig.appId) {
    cashfreeConfig.appId = cashfreeConfig.appId.trim();
}

if (cashfreeConfig.secretKey) {
    cashfreeConfig.secretKey = cashfreeConfig.secretKey.trim();
}

// Ensure baseUrl ends with /pg
if (!cashfreeConfig.baseUrl.endsWith('/pg')) {
    cashfreeConfig.baseUrl = cashfreeConfig.baseUrl.endsWith('/')
        ? `${cashfreeConfig.baseUrl}pg`
        : `${cashfreeConfig.baseUrl}/pg`;
}

// Optional: allow overriding the public payments UI host (used for redirect/hosted checkout)
// Example: CASHFREE_PAYMENTS_URL=https://payments.cashfree.com/session
let paymentsBase = process.env.CASHFREE_PAYMENTS_URL || (isProduction ? 'https://payments.cashfree.com/session' : 'https://sandbox.cashfree.com/session');
// Normalize: remove trailing slash if present
if (paymentsBase.endsWith('/')) paymentsBase = paymentsBase.slice(0, -1);
cashfreeConfig.paymentsBaseUrl = paymentsBase;

console.log('Active Config:');
console.log('- App ID:', cashfreeConfig.appId ? `${cashfreeConfig.appId.substring(0, 6)}...` : 'Not set');
console.log('- Base URL:', cashfreeConfig.baseUrl);
console.log('- Payments UI Base:', cashfreeConfig.paymentsBaseUrl);

export default cashfreeConfig;