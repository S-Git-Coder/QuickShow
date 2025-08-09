// Test script to check createBooking API
import axios from 'axios';

const testCreateBooking = async () => {
    try {
        // Use production URL instead of localhost
        const serverUrl = process.env.SERVER_URL || 'https://quickshow-server-sahil-patels-projects-4fd5f591.vercel.app';
        
        // First test if server is running
        const healthCheck = await axios.get(`${serverUrl}/`);
        console.log('Server health check:', healthCheck.status === 200 ? 'OK' : 'Failed');
        console.log('Server response:', healthCheck.data);

        // Check if any shows exist
        const showsResponse = await axios.get(`${serverUrl}/api/show/all`);
        console.log('Shows API response:', showsResponse.data);

    } catch (error) {
        console.log('Error:', error.response ? error.response.data : error.message);
        console.log('Status:', error.response ? error.response.status : 'No status');
    }
};

testCreateBooking();
