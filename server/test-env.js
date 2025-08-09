// Test script to verify environment configuration
import dotenv from 'dotenv';
import { getEnvironmentInfo } from './utils/urlBuilder.js';
import cashfreeConfig from './configs/cashfree.js';

// Load environment variables
dotenv.config();

console.log('Environment Information:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CASHFREE_USE_PRODUCTION:', process.env.CASHFREE_USE_PRODUCTION);
console.log('\nURL Builder Environment Info:');
console.log(JSON.stringify(getEnvironmentInfo(), null, 2));
console.log('\nCashfree Config:');
console.log(JSON.stringify(cashfreeConfig, null, 2));