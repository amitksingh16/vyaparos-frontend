const { Business, ActivityLog, User, CAClient, ComplianceItem } = require('./src/models');

const seedCA = async () => {
    try {
        console.log("Seeding CA test data...");

        let business = await Business.findOne();
        if (!business) {
            console.log("No business found. Please create a user and business first via the App.");
            return;
        }

        // 1. Create a CA user
        let caUser = await User.findOne({ where: { role: 'ca', phone: '9999999999' } });
        if (!caUser) {
            caUser = await User.create({
                name: 'Test CA',
                email: 'ca@vyaparos.test',
                phone: '9999999999',
                role: 'ca',
                is_verified: true,
                setup_completed: true
            });
            console.log("Created CA User: 9999999999");
        }

        // 2. Assign the CA to the business
        const existingAssignment = await CAClient.findOne({
            where: { ca_user_id: caUser.id, business_id: business.id }
        });

        if (!existingAssignment) {
            await CAClient.create({
                ca_user_id: caUser.id,
                business_id: business.id,
                status: 'active'
            });
            console.log("Assigned Business to CA.");
        } else {
            console.log("Business already assigned to CA.");
            existingAssignment.status = 'active';
            await existingAssignment.save();
        }

        console.log("CA Data seeded successfully. Login with 9999999999 to test Dashboard.");
    } catch (err) {
        console.error("Error creating CA mock data:", err);
    }
    process.exit(0);
};

seedCA();
