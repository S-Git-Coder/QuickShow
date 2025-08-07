# Cashfree Payment Gateway Integration

## Overview

This document explains how the Cashfree Payment Gateway integration is configured in the QuickShow application. The system is designed to use different Cashfree environments (sandbox/production) based on the application's running environment.

## Configuration

### Environment Variables

The following environment variables are used for Cashfree integration:

#### Production Credentials
```
CASHFREE_PRODUCTION_APP_ID=your_production_app_id
CASHFREE_PRODUCTION_SECRET_KEY=your_production_secret_key
CASHFREE_PRODUCTION_BASE_URL=https://api.cashfree.com/pg
```

#### Sandbox Credentials (for development)
```
CASHFREE_SANDBOX_APP_ID=your_sandbox_app_id
CASHFREE_SANDBOX_SECRET_KEY=your_sandbox_secret_key
CASHFREE_SANDBOX_BASE_URL=https://sandbox.cashfree.com/pg
```

#### Legacy Variables (maintained for backward compatibility)
```
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key
CASHFREE_BASE_URL=your_base_url
```

### Environment-Based Configuration

The application automatically selects the appropriate Cashfree environment based on the `NODE_ENV` environment variable:

- When `NODE_ENV=production`: Uses production credentials
- Otherwise: Uses sandbox credentials

This configuration is managed in `configs/cashfree.js`.

## Implementation

### Configuration File

The `configs/cashfree.js` file exports the appropriate configuration based on the current environment:

```javascript
// Determine if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Sandbox credentials (for development)
const sandboxConfig = {
    appId: process.env.CASHFREE_SANDBOX_APP_ID || process.env.CASHFREE_APP_ID,
    secretKey: process.env.CASHFREE_SANDBOX_SECRET_KEY || process.env.CASHFREE_SECRET_KEY,
    baseUrl: process.env.CASHFREE_SANDBOX_BASE_URL || 'https://sandbox.cashfree.com/pg'
};

// Production credentials (for live payments)
const productionConfig = {
    appId: process.env.CASHFREE_PRODUCTION_APP_ID || process.env.CASHFREE_APP_ID,
    secretKey: process.env.CASHFREE_PRODUCTION_SECRET_KEY || process.env.CASHFREE_SECRET_KEY,
    baseUrl: process.env.CASHFREE_PRODUCTION_BASE_URL || process.env.CASHFREE_BASE_URL || 'https://api.cashfree.com/pg'
};

// Export the appropriate configuration
const cashfreeConfig = isProduction ? productionConfig : sandboxConfig;
```

### Usage in Code

In your controllers and services, import and use the configuration:

```javascript
import cashfreeConfig from '../configs/cashfree.js';

// Use in API calls
const response = await axios.post(
  `${cashfreeConfig.baseUrl}/orders`,
  orderPayload,
  {
    headers: {
      'x-client-id': cashfreeConfig.appId,
      'x-client-secret': cashfreeConfig.secretKey,
      'x-api-version': '2022-01-01',
      'Content-Type': 'application/json'
    }
  }
);
```

## Environment Configuration

To run the application in production mode:

```
# Linux/Mac
NODE_ENV=production node server.js

# Windows (PowerShell)
$env:NODE_ENV="production"; node server.js

# Windows (CMD)
set NODE_ENV=production && node server.js
```

## Security Considerations

- Never commit actual API keys to the repository
- Use environment variables for all sensitive credentials
- Consider using a secrets management solution for production deployments