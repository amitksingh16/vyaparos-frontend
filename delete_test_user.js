const { sequelize } = require('./src/config/db');
const User = require('./src/models/User');

const run = async () => {
    try {
        await sequelize.authenticate();
        const result = await User.destroy({ where: { phone: '+919554140800' } });
        console.log(`Deleted ${result} user(s) with phone +919554140800`);
    } catch (e) {
        console.error('Error deleting user:', e);
    } finally {
        process.exit();
    }
}
run();
