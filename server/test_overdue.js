const { ComplianceItem, Business } = require('./src/models');

const simulateOverdue = async () => {
    try {
        const business = await Business.findOne();
        if (!business) {
            console.log("No business found");
            return;
        }

        const date = new Date();
        date.setDate(date.getDate() - 10); // 10 days ago

        const item = await ComplianceItem.create({
            business_id: business.id,
            compliance_type: 'gstr9',
            frequency: 'annually',
            due_date: date,
            status: 'upcoming',
            notes: 'Mock GSTR-9 for testing overdue logic'
        });

        console.log("Mock compliance created with due date:", item.due_date);
    } catch (err) {
        console.error("Error creating mock compliance:", err);
    }
    process.exit(0);
};

simulateOverdue();
