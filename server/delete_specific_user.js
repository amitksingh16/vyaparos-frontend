const { User, Business, CAClient } = require('./src/models');
const { sequelize } = require('./src/config/db');

async function deleteUserByEmailOrPhone() {
    try {
        await sequelize.authenticate();
        console.log('DB connected for deletion.');

        const email = 'singh.amitk82@gmail.com';
        const phone = '9554140800';

        const users = await User.findAll({
            where: {
                $or: [
                    { email: email },
                    { phone: phone }
                ]
            }
        });

        // Try standard Op.or if $or fails
        let foundUsers = users;
        if (!users || users.length === 0) {
            const users2 = await User.findAll();
            foundUsers = users2.filter(u => u.email === email || u.phone === phone);
        }

        if (foundUsers.length > 0) {
             for (const u of foundUsers) {
                 console.log(`Found user ID ${u.id} | Email: ${u.email} | Phone: ${u.phone}`);
                 await User.destroy({ where: { id: u.id }, force: true });
                 console.log(`Successfully deleted user ${u.id}`);
             }
        } else {
             console.log(`No user found with email ${email} or phone ${phone} in the backend database.`);
        }
        
    } catch (e) {
        console.error('Error deleting user:', e);
    } finally {
        process.exit(0);
    }
}

deleteUserByEmailOrPhone();
