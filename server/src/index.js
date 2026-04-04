const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  credentials: true
}));
app.options('*', cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const businessRoutes = require('./routes/businessRoutes');
const complianceRoutes = require('./routes/complianceRoutes');
const caRoutes = require('./routes/caRoutes');
const caTeamRoutes = require('./routes/caTeamRoutes');
const documentRoutes = require('./routes/documentRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
const actionRoutes = require('./routes/actionRoutes');

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/ca/team', caTeamRoutes);
app.use('/api/ca', caRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/actions', actionRoutes);

const cron = require('node-cron');
const { runDailyReminders } = require('./utils/reminderEngine');

// ── TEMPORARY ADMIN CLEANUP ENDPOINT ─────────────────────────────────────────
// DELETE after use. Protected by secret key.
app.delete('/api/_admin/clean-test-user', async (req, res) => {
    const SECRET = 'vyaparos-dev-cleanup-2026';
    if (req.headers['x-admin-secret'] !== SECRET) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    try {
        const { sequelize } = require('./config/db');
        const TARGET_EMAIL = 'singh.amitk82@gmail.com';
        const TARGET_PHONE = '9554140800';

        const [users] = await sequelize.query(
            `SELECT id, name, email, phone, role FROM users WHERE email = ? OR phone = ?`,
            { replacements: [TARGET_EMAIL, TARGET_PHONE] }
        );

        if (users.length === 0) {
            return res.json({ message: 'No matching user found. Already clean.' });
        }

        const userIds = users.map(u => u.id);
        const placeholders = userIds.map(() => '?').join(', ');

        const [businesses] = await sequelize.query(
            `SELECT id FROM businesses WHERE owner_id IN (${placeholders})`,
            { replacements: userIds }
        );
        const businessIds = businesses.map(b => b.id);

        if (businessIds.length > 0) {
            const bPlaceholders = businessIds.map(() => '?').join(', ');
            await sequelize.query(`DELETE FROM notification_logs WHERE business_id IN (${bPlaceholders})`, { replacements: businessIds });
            await sequelize.query(`DELETE FROM compliance_items WHERE business_id IN (${bPlaceholders})`, { replacements: businessIds });
            await sequelize.query(`DELETE FROM documents WHERE business_id IN (${bPlaceholders})`, { replacements: businessIds });
            await sequelize.query(`DELETE FROM ca_clients WHERE business_id IN (${bPlaceholders})`, { replacements: businessIds });
            await sequelize.query(`DELETE FROM staff_client_assignments WHERE business_id IN (${bPlaceholders})`, { replacements: businessIds });
            await sequelize.query(`DELETE FROM client_metas WHERE business_id IN (${bPlaceholders})`, { replacements: businessIds });
            await sequelize.query(`DELETE FROM activity_logs WHERE client_id IN (${bPlaceholders})`, { replacements: businessIds });
            await sequelize.query(`DELETE FROM businesses WHERE id IN (${bPlaceholders})`, { replacements: businessIds });
        }

        await sequelize.query(`DELETE FROM reminders WHERE user_id IN (${placeholders})`, { replacements: userIds });
        await sequelize.query(`DELETE FROM activity_logs WHERE performed_by IN (${placeholders})`, { replacements: userIds });
        await sequelize.query(`DELETE FROM notifications WHERE user_id IN (${placeholders})`, { replacements: userIds });
        await sequelize.query(`DELETE FROM invitations WHERE ca_id IN (${placeholders})`, { replacements: userIds });
        await sequelize.query(`DELETE FROM ca_clients WHERE ca_id IN (${placeholders})`, { replacements: userIds });
        await sequelize.query(`DELETE FROM staff_client_assignments WHERE staff_id IN (${placeholders})`, { replacements: userIds });
        await sequelize.query(`DELETE FROM documents WHERE uploaded_by IN (${placeholders})`, { replacements: userIds });
        await sequelize.query(`DELETE FROM users WHERE parent_ca_id IN (${placeholders})`, { replacements: userIds });
        await sequelize.query(`DELETE FROM users WHERE id IN (${placeholders})`, { replacements: userIds });

        return res.json({
            message: `✅ Cleaned up ${users.length} user(s)`,
            deleted_users: users.map(u => ({ id: u.id, email: u.email, phone: u.phone, role: u.role })),
            deleted_businesses: businessIds
        });
    } catch (err) {
        console.error('[CLEANUP] Error:', err);
        return res.status(500).json({ message: 'Cleanup failed', error: err.message });
    }
});
// ── END TEMPORARY ENDPOINT ────────────────────────────────────────────────────



app.get('/', (req, res) => {
    res.send('Backend is Alive');
});

// Intelligent Reminder System: Run daily at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Executing scheduled daily reminder engine...');
    await runDailyReminders();
});

const startServer = async () => {
    try {
        const { sequelize } = require('./config/db');
        
        // Ensure connection is established
        await sequelize.authenticate();
        console.log('[DB] Connection established successfully.');
        
        // Force table alteration/creation temporarily for deployment
        console.log('[DB] Syncing models to database...');
        await sequelize.sync({ alter: true });
        
        // Deep Database Sync: Cleanup orphaned staff_client_assignments
        console.log('[SYNC] Cleaning up orphaned client assignments...');
        await sequelize.query(`
            DELETE FROM staff_client_assignments 
            WHERE business_id NOT IN (SELECT id FROM businesses)
        `);
        console.log('[SYNC] Cleanup complete.');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
    }
};

startServer();
