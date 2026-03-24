const axios = require('axios');
async function test() {
  try {
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'gupta@tax.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('Login successful. Token acquired.');

    const dashRes = await axios.get('http://localhost:3000/api/ca/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Dashboard Response Status:', dashRes.status);
    console.log('Total Clients Returned:', dashRes.data.stats.total);
    console.log('Clients Length:', dashRes.data.clients.length);
    if (dashRes.data.clients.length > 0) {
      console.log('First Client:', dashRes.data.clients[0].business_name);
    }
  } catch (err) {
    if (err.response) {
      console.error('API Error:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}
test();
