const { sequelize, User, Business, CAClient, StaffClientAssignment, ClientMeta, Document, ComplianceItem, ActivityLog, NotificationLog, Notification, Reminder, Invitation } = require('./src/models');

async function cleanData() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');
        
        // Sync to ensure columns like "phone" exist
        await sequelize.sync({ alter: true });

        const email = 'amit@example.com';
        const phone = '9554140800';

        let user = await User.findOne({ where: { phone: phone } });
        if (!user) {
            user = await User.findOne({ where: { email: email } });
        }

        if (!user) {
            console.log('User not found in DB with either email or phone.');
            return;
        }

        console.log('Found user:', user.id, user.email, user.phone);

        // Delete associated Businesses
        const businesses = await Business.findAll({ where: { owner_id: user.id } });
        for (let b of businesses) {
            console.log('Deleting Business & related data:', b.id);
            await ClientMeta.destroy({ where: { business_id: b.id } });
            await Document.destroy({ where: { business_id: b.id } });
            await ComplianceItem.destroy({ where: { business_id: b.id } });
            await ActivityLog.destroy({ where: { client_id: b.id } });
            await NotificationLog.destroy({ where: { business_id: b.id } });
            await CAClient.destroy({ where: { business_id: b.id } });
            await b.destroy();
        }

        console.log('Deleting CA links...');
        await CAClient.destroy({ where: { ca_id: user.id } });
        await Invitation.destroy({ where: { ca_id: user.id } });
        await Notification.destroy({ where: { user_id: user.id } });
        await Reminder.destroy({ where: { user_id: user.id } });

        console.log('Deleting User record...');
        await user.destroy();
        
        console.log('User and associated data successfully deleted.');
    } catch (e) {
        console.error('Error cleaning data:', e);
    } finally {
        await sequelize.close();
    }
}

cleanData();
