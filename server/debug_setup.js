const { sequelize } = require('./src/config/db');
const { User, Business, CAClient, ComplianceItem } = require('./src/models');
const { generateInitialCompliances } = require('./src/controllers/complianceController');

async function testSetup() {
    try {
        await sequelize.authenticate();

        // Find a CA user
        const caUser = await User.findOne({ where: { role: 'ca' } });
        if (!caUser) throw new Error("No CA User found");

        console.log("Found CA User:", caUser.id);

        // Emulate Step 2
        const newBusiness = await Business.create({
            business_name: "Test Bug Business",
            business_type: "prop",
            gstin: null,
            filing_type: "monthly",
            state: "MH",
        });
        console.log("Created Business:", newBusiness.id);

        // Emulate Step 3
        await CAClient.create({
            ca_user_id: caUser.id,
            business_id: newBusiness.id,
            status: 'active'
        });
        console.log("Linked CA Client");

        // Emulate Step 4
        await generateInitialCompliances(newBusiness);
        console.log("Success");

    } catch (e) {
        console.error("DEBUG ERROR:", e);
    } finally {
        process.exit();
    }
}

testSetup();
