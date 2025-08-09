// Test script to verify all URLs are set to production
import dotenv from 'dotenv';
import { getEnvironmentInfo } from './utils/urlBuilder.js';
import cashfreeConfig from './configs/cashfree.js';

// Load environment variables
dotenv.config();

console.log('=== PRODUCTION URL VERIFICATION ===');

// Check environment variables
console.log('\nEnvironment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CASHFREE_USE_PRODUCTION:', process.env.CASHFREE_USE_PRODUCTION);
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('SERVER_URL:', process.env.SERVER_URL);

// Check URL Builder
console.log('\nURL Builder Configuration:');
const envInfo = getEnvironmentInfo();
console.log(JSON.stringify(envInfo, null, 2));

// Check Cashfree Configuration
console.log('\nCashfree Configuration:');
console.log(JSON.stringify(cashfreeConfig, null, 2));

// Verify production URLs
console.log('\nProduction URL Verification:');
const expectedClientUrl = 'https://quick-show.vercel.app';
const expectedServerUrl = 'https://quickshow-server-sahil-patels-projects-4fd5f591.vercel.app';
const expectedCashfreeBaseUrl = 'https://api.cashfree.com/pg';
const expectedCashfreePaymentUrl = 'https://payments.cashfree.com/pay/';

console.log('Client URL correct:', envInfo.clientUrl === expectedClientUrl);
console.log('Server URL correct:', envInfo.serverUrl === expectedServerUrl);
console.log('Cashfree Base URL correct:', cashfreeConfig.baseUrl === expectedCashfreeBaseUrl);

// Summary
console.log('\nSummary:');
const allCorrect = 
    envInfo.clientUrl === expectedClientUrl &&
    envInfo.serverUrl === expectedServerUrl &&
    cashfreeConfig.baseUrl === expectedCashfreeBaseUrl &&
    process.env.NODE_ENV === 'production' &&
    process.env.CASHFREE_USE_PRODUCTION === 'true';

console.log('All URLs set correctly to production:', allCorrect ? '✅ YES' : '❌ NO');

if (!allCorrect) {
    console.log('\nIssues found:');
    if (envInfo.clientUrl !== expectedClientUrl) {
        console.log(`- Client URL is ${envInfo.clientUrl} but should be ${expectedClientUrl}`);
    }
    if (envInfo.serverUrl !== expectedServerUrl) {
        console.log(`- Server URL is ${envInfo.serverUrl} but should be ${expectedServerUrl}`);
    }
    if (cashfreeConfig.baseUrl !== expectedCashfreeBaseUrl) {
        console.log(`- Cashfree Base URL is ${cashfreeConfig.baseUrl} but should be ${expectedCashfreeBaseUrl}`);
    }
    if (process.env.NODE_ENV !== 'production') {
        console.log(`- NODE_ENV is ${process.env.NODE_ENV} but should be production`);
    }
    if (process.env.CASHFREE_USE_PRODUCTION !== 'true') {
        console.log(`- CASHFREE_USE_PRODUCTION is ${process.env.CASHFREE_USE_PRODUCTION} but should be true`);
    }
}