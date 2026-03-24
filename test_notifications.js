const { ComplianceItem, Business, sequelize } = require('./src/models');
const { runDailyReminders } = require('./src/utils/reminderEngine');
const { Op } = require('sequelize');

(async () => {
    try {
        await sequelize.authenticate();
        console.log("DB connected.");

        // Fetch a business
        const business = await Business.findOne();
        if (!business) {
            console.log("No business found");
            process.exit(0);
        }

        // Enable alerts for testing
        business.whatsapp_alerts = true;
        business.email_digest = true;
        await business.save();

        // Create compliance items for each T-Minus stage
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const d15 = new Date(today); d15.setDate(d15.getDate() + 15);
        const d7 = new Date(today); d7.setDate(d7.getDate() + 7);
        const d3 = new Date(today); d3.setDate(d3.getDate() + 3);
        const d0 = new Date(today);
        const dMinus1 = new Date(today); dMinus1.setDate(dMinus1.getDate() - 1);

        // Fields required: compliance_type (gstr1, gstr3b, etc), frequency (monthly, etc), due_date, status.
        await ComplianceItem.bulkCreate([
            { business_id: business.id, compliance_type: "gstr3b", frequency: "monthly", status: "upcoming", due_date: d15 },
            { business_id: business.id, compliance_type: "gstr3b", frequency: "monthly", status: "upcoming", due_date: d7 },
            { business_id: business.id, compliance_type: "gstr3b", frequency: "monthly", status: "pending", due_date: d3 },
            { business_id: business.id, compliance_type: "gstr3b", frequency: "monthly", status: "pending", due_date: d0 },
            { business_id: business.id, compliance_type: "gstr3b", frequency: "monthly", status: "overdue", due_date: dMinus1 }
        ]);
        console.log("Test Compliance Items Created.");

        // Run reminders engine
        await runDailyReminders();

        console.log("Test script finished executing.");
        process.exit(0);

    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
})();
