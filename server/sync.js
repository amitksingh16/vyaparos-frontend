const { sequelize, Document } = require('./src/models');

const syncDB = async () => {
    try {
        await sequelize.authenticate();
        await Document.sync({ alter: true });
        console.log('Document table synced successfully with alter: true.');
        process.exit(0);
    } catch (err) {
        console.error('Unable to sync Document table:', err);
        process.exit(1);
    }
};

syncDB();
