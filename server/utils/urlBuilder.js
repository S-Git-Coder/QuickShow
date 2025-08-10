/**
 * URL Builder Utility for Environment-Aware URL Construction
 * Automatically uses HTTPS in production and HTTP in development
 */

/**
 * Get the correct protocol based on environment
 * @returns {string} 'https' for production, 'http' for development
 */
const getProtocol = () => {
    const isProduction = process.env.NODE_ENV === 'production' ||
        process.env.VERCEL_ENV === 'production' ||
        process.env.CASHFREE_USE_PRODUCTION === 'true';

    return isProduction ? 'https' : 'http';
};

/**
 * Get the correct base URL based on environment
 * @returns {object} { clientUrl, serverUrl }
 */
const getBaseUrls = () => {
    const isProduction = process.env.NODE_ENV === 'production' ||
        process.env.VERCEL_ENV === 'production' ||
        process.env.CASHFREE_USE_PRODUCTION === 'true';

    let clientUrl, serverUrl;
    
    if (isProduction) {
        clientUrl = process.env.CLIENT_URL || 'https://quickshow-pied.vercel.app';
        serverUrl = process.env.SERVER_URL || 'https://quickshow-server-alpha-three.vercel.app';
    } else {
        clientUrl = process.env.CLIENT_URL || process.env.VITE_CLIENT_URL || 'http://localhost:5174';
        serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
    }
    
    // Log the URLs being used
    console.log('URL Configuration:');
    console.log('- Client URL:', clientUrl);
    console.log('- Server URL:', serverUrl);
    
    return { clientUrl, serverUrl };
};

/**
 * Build return URL for Cashfree payment redirection
 * @param {string} orderId - The order ID to include in the URL
 * @returns {string} Complete return URL
 */
const buildReturnUrl = (orderId) => {
    const { clientUrl } = getBaseUrls();
    const isProduction = process.env.NODE_ENV === 'production' ||
        process.env.VERCEL_ENV === 'production' ||
        process.env.CASHFREE_USE_PRODUCTION === 'true';
    
    // Check if we're using localhost
    const isLocalhost = clientUrl.includes('localhost');
    
    // Force https for production or when CASHFREE_USE_PRODUCTION is true, but only if not localhost
    if (isProduction && !isLocalhost) {
        // If clientUrl already starts with https, use it as is
        if (clientUrl.startsWith('https://')) {
            return `${clientUrl}/my-bookings?orderId=${orderId}`;
        }
        // Otherwise, replace http:// with https://
        else if (clientUrl.startsWith('http://')) {
            const httpsUrl = clientUrl.replace('http://', 'https://');
            return `${httpsUrl}/my-bookings?orderId=${orderId}`;
        }
        // If no protocol, assume https
        else {
            return `https://${clientUrl}/my-bookings?orderId=${orderId}`;
        }
    }
    
    return `${clientUrl}/my-bookings?orderId=${orderId}`;
};

/**
 * Build notify URL for Cashfree webhook callbacks
 * @returns {string} Complete notify URL
 */
const buildNotifyUrl = () => {
    const { serverUrl } = getBaseUrls();
    const isProduction = process.env.NODE_ENV === 'production' ||
        process.env.VERCEL_ENV === 'production' ||
        process.env.CASHFREE_USE_PRODUCTION === 'true';
    
    // Check if we're using localhost
    const isLocalhost = serverUrl.includes('localhost');
    
    // Force https for production or when CASHFREE_USE_PRODUCTION is true, but only if not localhost
    if (isProduction && !isLocalhost) {
        // If serverUrl already starts with https, use it as is
        if (serverUrl.startsWith('https://')) {
            return `${serverUrl}/api/booking/callback`;
        }
        // Otherwise, replace http:// with https://
        else if (serverUrl.startsWith('http://')) {
            const httpsUrl = serverUrl.replace('http://', 'https://');
            return `${httpsUrl}/api/booking/callback`;
        }
        // If no protocol, assume https
        else {
            return `https://${serverUrl}/api/booking/callback`;
        }
    }
    
    return `${serverUrl}/api/booking/callback`;
};

/**
 * Get environment info for logging
 * @returns {object} Environment information
 */
const getEnvironmentInfo = () => {
    const { clientUrl, serverUrl } = getBaseUrls();
    const protocol = getProtocol();
    const isProduction = process.env.NODE_ENV === 'production' ||
        process.env.VERCEL_ENV === 'production' ||
        process.env.CASHFREE_USE_PRODUCTION === 'true';

    return {
        environment: process.env.NODE_ENV || 'development',
        isProduction: isProduction,
        protocol,
        clientUrl,
        serverUrl,
        vercelEnv: process.env.VERCEL_ENV || 'not-vercel',
        cashfreeProduction: process.env.CASHFREE_USE_PRODUCTION === 'true'
    };
};

export {
    getProtocol,
    getBaseUrls,
    buildReturnUrl,
    buildNotifyUrl,
    getEnvironmentInfo
};
