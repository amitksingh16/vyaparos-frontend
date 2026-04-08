const { User } = require('../src/models');

async function run() {
    try {
        const deletedEmail = await User.destroy({
            where: {
                email: 'singh.amitk82@gmail.com'
            }
        });
        console.log(`Deleted ${deletedEmail} users by email.`);
        
        const deletedPhone = await User.destroy({
            where: {
                phone: '9554140800'
            }
        });
        console.log(`Deleted ${deletedPhone} users by phone.`);

        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}
run();
