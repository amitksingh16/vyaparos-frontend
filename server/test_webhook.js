const axios = require('axios');

async function testWebhook() {
    try {
        const response = await axios.post('http://localhost:5000/api/documents/webhook/receive', {
            file_url: 'https://example.com/mock-receipt-image.jpg',
            name: 'WhatsApp Image 2026-03-15',
            size: 153200,
            sender_mobile: '+919876543210',
            text: 'Here are my docs REF:e18b828a-785c-4861-aff3-5ec9deecab97' // Mock Staff ID
        });

        console.log('Successfully received webhook document:');
        console.log(response.data);
    } catch (err) {
        console.error('Failed to post webhook document:', err.response ? err.response.data : err.message);
    }
}

testWebhook();
