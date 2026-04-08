const db = require('./src/models');
const { Op } = require('sequelize');

async function cleanup() {
    try {
        await db.sequelize.authenticate();
        console.log('Connected.');
        const duplicates = await db.Business.findAll({
            where: {
                business_name: {
                    [Op.like]: 'Test Client%'
                }
            },
            order: [['createdAt', 'ASC']]
        });

        console.log(`Found ${duplicates.length} test clients.`);

        if (duplicates.length > 1) {
            // Keep the first one, delete the rest
            const idsToDelete = duplicates.slice(1).map(d => d.id);
            await db.CAClient.destroy({ where: { business_id: { [Op.in]: idsToDelete } } });
            await db.ComplianceItem.destroy({ where: { business_id: { [Op.in]: idsToDelete } } });
            await db.ActivityLog.destroy({ where: { client_id: { [Op.in]: idsToDelete } } });
            await db.Business.destroy({ where: { id: { [Op.in]: idsToDelete } } });

            console.log(`Deleted ${idsToDelete.length} duplicates.`);
        } else {
            console.log('No duplicates to delete.');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
cleanup();
