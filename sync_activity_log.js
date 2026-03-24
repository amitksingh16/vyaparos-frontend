const { sequelize, ActivityLog } = require('./src/models');

const syncTable = async () => {
    try {
        console.log('Force syncing ActivityLog table to apply new schema...');
        await ActivityLog.sync({ force: true });
        console.log('ActivityLog table synced successfully.');
    } catch (err) {
        console.error('Error syncing ActivityLog:', err);
    }
    process.exit(0);
};

syncTable();
