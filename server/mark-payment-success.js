// Script to manually mark a payment as successful for debugging
import axios from 'axios';
import 'dotenv/config';

const markPaymentSuccess = async (orderId) => {
    if (!orderId) {
        console.error('Please provide an orderId');
        console.log('Usage: node mark-payment-success.js <orderId>');
        process.exit(1);
    }

    try {
        console.log('🔄 Marking payment as successful for orderId:', orderId);

        // Simulate successful payment webhook
        const webhookData = {
            orderId: orderId,
            orderAmount: '100.00',
            referenceId: `manual_${Date.now()}`,
            txStatus: 'SUCCESS',
            paymentMode: 'MANUAL_VERIFICATION',
            txMsg: 'Manual payment verification',
            txTime: new Date().toISOString(),
            signature: 'manual_signature'
        };

        const response = await axios.post('http://localhost:3000/api/booking/callback', webhookData, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-version': '2022-01-01'
            }
        });

        console.log('✅ Payment marked as successful:', response.data);

        // Also test the verification endpoint
        const verifyResponse = await axios.get(`http://localhost:3000/api/booking/verify/${orderId}`);
        console.log('✅ Verification result:', verifyResponse.data);

    } catch (error) {
        console.error('❌ Error marking payment as successful:', error.response?.data || error.message);
    }
};

// Get orderId from command line argument
const orderId = process.argv[2];
markPaymentSuccess(orderId);
