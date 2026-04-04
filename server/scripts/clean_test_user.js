/**
 * Clean Test User Script
 * Removes all data for singh.amitk82@gmail.com / 9554140800
 * so the CA onboarding workflow can be tested fresh.
 *
 * Run from: d:\VyaparOS\server
 *   node scripts/clean_test_user.js
 */

const { sequelize } = require('../src/config/db');

const TARGET_EMAIL = 'singh.amitk82@gmail.com';
const TARGET_PHONE = '9554140800';

async function run() {
    try {
        await sequelize.authenticate();
        console.log('[DB] Connected to SQLite.\n');

        // Step 1: Find the user(s) matching email or phone
        const [users] = await sequelize.query(
            `SELECT id, name, email, phone, role FROM users WHERE email = ? OR phone = ?`,
            { replacements: [TARGET_EMAIL, TARGET_PHONE] }
        );

        if (users.length === 0) {
            console.log('✅ No matching user found. Database is already clean.');
            process.exit(0);
        }

        console.log(`Found ${users.length} user(s) to delete:`);
        users.forEach(u => console.log(`  → [${u.id}] ${u.name} | ${u.email} | ${u.phone} | role: ${u.role}`));
        console.log('');

        const userIds = users.map(u => u.id);
        const placeholders = userIds.map(() => '?').join(', ');

        // Step 2: Find all businesses owned by this user
        const [businesses] = await sequelize.query(
            `SELECT id, name FROM businesses WHERE owner_id IN (${placeholders})`,
            { replacements: userIds }
        );

        const businessIds = businesses.map(b => b.id);
        console.log(`Found ${businesses.length} business(es):`, businessIds.length ? businessIds : 'none');

        if (businessIds.length > 0) {
            const bPlaceholders = businessIds.map(() => '?').join(', ');

            // Delete in order: deepest dependents first
            const [dlogs] = await sequelize.query(`DELETE FROM notification_logs WHERE business_id IN (${bPlaceholders})`, { replacements: businessIds });
            console.log(`  Deleted notification_logs`);

            await sequelize.query(`DELETE FROM compliance_items WHERE business_id IN (${bPlaceholders})`, { replacements: businessIds });
            console.log(`  Deleted compliance_items`);

            await sequelize.query(`DELETE FROM documents WHERE business_id IN (${bPlaceholders})`, { replacements: businessIds });
            console.log(`  Deleted documents`);

            await sequelize.query(`DELETE FROM reminders WHERE user_id IN (${placeholders})`, { replacements: userIds });
            console.log(`  Deleted reminders`);

            await sequelize.query(`DELETE FROM ca_clients WHERE business_id IN (${bPlaceholders})`, { replacements: businessIds });
            console.log(`  Deleted ca_clients`);

            await sequelize.query(`DELETE FROM staff_client_assignments WHERE business_id IN (${bPlaceholders})`, { replacements: businessIds });
            console.log(`  Deleted staff_client_assignments`);

            await sequelize.query(`DELETE FROM client_metas WHERE business_id IN (${bPlaceholders})`, { replacements: businessIds });
            console.log(`  Deleted client_metas`);

            await sequelize.query(`DELETE FROM activity_logs WHERE client_id IN (${bPlaceholders})`, { replacements: businessIds });
            console.log(`  Deleted activity_logs (business)`);

            await sequelize.query(`DELETE FROM businesses WHERE id IN (${bPlaceholders})`, { replacements: businessIds });
            console.log(`  Deleted businesses`);
        }

        // Step 3: Delete user-level records
        await sequelize.query(`DELETE FROM activity_logs WHERE performed_by IN (${placeholders})`, { replacements: userIds });
        console.log(`  Deleted activity_logs (user)`);

        await sequelize.query(`DELETE FROM notifications WHERE user_id IN (${placeholders})`, { replacements: userIds });
        console.log(`  Deleted notifications`);

        await sequelize.query(`DELETE FROM invitations WHERE ca_id IN (${placeholders})`, { replacements: userIds });
        console.log(`  Deleted invitations`);

        await sequelize.query(`DELETE FROM ca_clients WHERE ca_id IN (${placeholders})`, { replacements: userIds });
        console.log(`  Deleted ca_clients (as CA)`);

        await sequelize.query(`DELETE FROM staff_client_assignments WHERE staff_id IN (${placeholders})`, { replacements: userIds });
        console.log(`  Deleted staff_client_assignments (as staff)`);

        await sequelize.query(`DELETE FROM documents WHERE uploaded_by IN (${placeholders})`, { replacements: userIds });
        console.log(`  Deleted documents (uploaded by user)`);

        // Step 4: Delete child users (CA staff/articles) whose parent_ca_id matches
        await sequelize.query(`DELETE FROM users WHERE parent_ca_id IN (${placeholders})`, { replacements: userIds });
        console.log(`  Deleted child team members (parent_ca_id)`);

        // Step 5: Finally delete the user(s)
        await sequelize.query(`DELETE FROM users WHERE id IN (${placeholders})`, { replacements: userIds });
        console.log(`  Deleted user(s)`);

        console.log('\n✅ Cleanup complete. singh.amitk82@gmail.com / 9554140800 is now fresh for testing.');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Error during cleanup:', err.message);
        console.error(err);
        process.exit(1);
    }
}

run();
