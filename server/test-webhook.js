// Test script to simulate Cashfree webhook callbacks
import axios from 'axios';

// Webhook test data for different API versions
const testVersions = [
  {
    version: '2022-09-01',
    webhookData: {
      orderId: 'order_test2022',
      orderAmount: '100.00',
      referenceId: 'ref_2022_09_01',
      txStatus: 'SUCCESS',
      paymentMode: 'CREDIT_CARD',
      txMsg: 'Transaction successful',
      txTime: '2022-09-01T12:00:00Z',
      signature: 'test_signature_2022'
    }
  },
  {
    version: '2023-08-01',
    webhookData: {
      orderId: 'order_test2023',
      orderAmount: '100.00',
      referenceId: 'ref_2023_08_01',
      txStatus: 'SUCCESS',
      paymentMode: 'UPI',
      txMsg: 'Transaction successful',
      txTime: '2023-08-01T12:00:00Z',
      signature: 'test_signature_2023'
    }
  },
  {
    version: '2025-01-01',
    webhookData: {
      orderId: 'order_test2025',
      orderAmount: '100.00',
      referenceId: 'ref_2025_01_01',
      txStatus: 'SUCCESS',
      paymentMode: 'NET_BANKING',
      txMsg: 'Transaction successful',
      txTime: '2025-01-01T12:00:00Z',
      signature: 'test_signature_2025'
    }
  }
];

// Function to test webhook for a specific version
async function testWebhook(versionIndex) {
  const testData = testVersions[versionIndex];
  console.log(`Testing webhook for version: ${testData.version}`);
  
  try {
    // Send webhook data to the callback endpoint
    const response = await axios.post(
      'http://localhost:3000/api/booking/callback',
      testData.webhookData,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-timestamp': new Date().toISOString(),
          'x-webhook-signature': testData.webhookData.signature,
          'x-api-version': testData.version
        }
      }
    );
    
    console.log('Webhook test response:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Webhook test error:', error.message);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
      return { success: false, error: error.message, data: error.response.data };
    }
    return { success: false, error: error.message };
  }
}

// Get version index from command line argument or default to 0 (first version)
const versionIndex = process.argv[2] ? parseInt(process.argv[2]) : 0;

if (versionIndex < 0 || versionIndex >= testVersions.length) {
  console.error(`Invalid version index. Please use 0-${testVersions.length - 1}`);
  process.exit(1);
}

// Run the test
testWebhook(versionIndex).then(result => {
  console.log('Test completed with result:', result);
  if (result.success) {
    console.log(`✅ Webhook test for version ${testVersions[versionIndex].version} was successful!`);
  } else {
    console.log(`❌ Webhook test for version ${testVersions[versionIndex].version} failed!`);
  }
});