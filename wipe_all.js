const { sequelize } = require('./src/models/index');

async function wipeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('DB connected.');

        console.log('Force syncing database... This will drop all tables and recreate them.');
        await sequelize.sync({ force: true });
        
        console.log('Database wiped and tables recreated successfully!');
        console.log('You can now proceed with fresh CA onboarding for singh.amitk82@gmail.com.');
        process.exit(0);
    } catch (e) {
        console.error('Error wiping database:', e);
        process.exit(1);
    }
}

wipeDatabase();
