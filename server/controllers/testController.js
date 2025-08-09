import { buildReturnUrl, buildNotifyUrl, getEnvironmentInfo } from "../utils/urlBuilder.js";

// Test endpoint to verify URL builder functionality
export const testUrlBuilder = (req, res) => {
    try {
        const envInfo = getEnvironmentInfo();
        const testOrderId = "order_test123";
        const returnUrl = buildReturnUrl(testOrderId);
        const notifyUrl = buildNotifyUrl();

        const testResults = {
            timestamp: new Date().toISOString(),
            environment: envInfo,
            urls: {
                returnUrl,
                notifyUrl
            },
            validations: {
                returnUrlIsHttps: returnUrl.startsWith('https://'),
                notifyUrlIsHttps: notifyUrl.startsWith('https://'),
                returnUrlIncludesOrderId: returnUrl.includes(testOrderId),
                notifyUrlValid: notifyUrl.includes('/api/booking/callback')
            }
        };

        console.log('🧪 URL Builder Test Results:', JSON.stringify(testResults, null, 2));

        res.json({
            success: true,
            message: 'URL Builder test completed',
            results: testResults
        });
    } catch (error) {
        console.error('❌ URL Builder test failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'URL Builder test failed',
            error: error.message
        });
    }
};
