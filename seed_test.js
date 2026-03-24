const { sequelize, User, Business, StaffClientAssignment, Document, CAClient } = require('./src/models');

const seedData = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Wipe existing data cleanly by dropping and re-creating tables
        await sequelize.query('PRAGMA foreign_keys = OFF');
        await sequelize.sync({ force: true });
        await sequelize.query('PRAGMA foreign_keys = ON');

        console.log('Existing data wiped.');

        // 1. Create CA
        const ca = await User.create({
            name: 'Gupta Tax Advisory',
            email: 'gupta@tax.com',
            phone: '9999999999',
            role: 'ca',
            is_verified: true,
            setup_completed: true,
            business_name: 'Gupta Tax Advisory'
        });

        // 2. Create Staff Members
        const rahul = await User.create({
            name: 'Rahul Article',
            email: 'rahul@tax.com',
            phone: '8888888888',
            role: 'ca_staff',
            parent_ca_id: ca.id,
            is_verified: true,
            setup_completed: true,
            invite_status: 'active'
        });

        const priya = await User.create({
            name: 'Priya Staff',
            email: 'priya@tax.com',
            phone: '7777777777',
            role: 'ca_staff',
            parent_ca_id: ca.id,
            is_verified: true,
            setup_completed: true,
            invite_status: 'active'
        });

        // 3. Create Clients
        const sharma = await Business.create({
            business_name: 'Sharma Kirana Store',
            email: 'sharma@example.com',
            primary_mobile: '9876543210',
            business_type: 'prop',
            filing_type: 'monthly',
            added_by_staff_id: null
        });

        const technova = await Business.create({
            business_name: 'TechNova Solutions',
            email: 'info@technova.com',
            primary_mobile: '9876543211',
            business_type: 'pvt_ltd',
            filing_type: 'monthly',
            added_by_staff_id: null
        });

        const verma = await Business.create({
            business_name: 'Verma Auto Parts',
            email: 'contact@vermaauto.com',
            primary_mobile: '9876543212',
            business_type: 'partnership',
            filing_type: 'quarterly',
            added_by_staff_id: null
        });

        const blueWater = await Business.create({
            business_name: 'Blue Water Cafe',
            email: 'hello@bluewater.com',
            primary_mobile: '9876543213',
            business_type: 'prop',
            filing_type: 'monthly',
            added_by_staff_id: null
        });

        // 3.5 Create CAClient bindings
        await CAClient.create({ ca_id: ca.id, business_id: sharma.id, status: 'active' });
        await CAClient.create({ ca_id: ca.id, business_id: technova.id, status: 'active' });
        await CAClient.create({ ca_id: ca.id, business_id: verma.id, status: 'active' });
        await CAClient.create({ ca_id: ca.id, business_id: blueWater.id, status: 'active' });

        // 4. Assignments
        // Link Sharma Kirana Store and Verma Auto Parts to Rahul
        await StaffClientAssignment.create({ staff_id: rahul.id, business_id: sharma.id });
        await StaffClientAssignment.create({ staff_id: rahul.id, business_id: verma.id });

        // Link TechNova Solutions to Priya
        await StaffClientAssignment.create({ staff_id: priya.id, business_id: technova.id });

        // Blue Water Cafe remains unassigned

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
