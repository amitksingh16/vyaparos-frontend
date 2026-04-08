const axios = require('axios');

async function testInvites() {
    try {
        console.log("Waiting for backend...");
        
        // Simulating the user testing the endpoint or checking DB directly
        const { sequelize } = require('./src/config/db');
        const Invitation = require('./src/models/Invitation');
        
        await sequelize.authenticate();
        console.log("DB connected");

        // We'll just sync the DB here to ensure the Invitation table is created
        await sequelize.sync({ alter: true });
        console.log("Database synchronized for Invitation model.");
        
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
testInvites();
