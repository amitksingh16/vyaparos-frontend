const fs = require('fs');
const { sequelize } = require('./src/models');
async function run() {
  try {
    const [businesses] = await sequelize.query("SELECT * FROM businesses LIMIT 1");
    const [cas] = await sequelize.query("SELECT * FROM users WHERE role='ca' LIMIT 1");
    if (cas.length === 0) {
      fs.writeFileSync('test_output.json', JSON.stringify({error: 'No CA found'}), 'utf8');
      return;
    }
    const caId = cas[0].id;
    const [ca_clients] = await sequelize.query(`SELECT * FROM ca_clients WHERE ca_id='${caId}'`);
    const [assignments] = await sequelize.query(`SELECT * FROM staff_client_assignments`);
    
    fs.writeFileSync('test_output.json', JSON.stringify({
      business_columns: Object.keys(businesses[0] || {}),
      ca_id: caId,
      ca_clients,
      assignments,
      businesses
    }, null, 2), 'utf8');

  } catch(e) {
    fs.writeFileSync('test_output.json', JSON.stringify({error: e.message}), 'utf8');
  }
}
run();
