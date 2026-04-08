const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    const email = 'amit@example.com';
    const phone = '9554140800';

    console.log('Using raw sqlite3 driver to avoid Sequelize limitations...');

    db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) {
            // "no such column" if phone used, but email should exist.
            console.error('Error finding user by email:', err.message);
            return;
        }

        if (!row) {
            // Tricky: if schema doesn't match and email wasn't found, try without email if needed.
            console.log('User not found by email. Let us try just deleting anyway.');
            deleteAndCleanup(null, email, phone);
        } else {
            console.log('Found user by email with ID:', row.id);
            deleteAndCleanup(row.id, email, phone);
        }
    });

    function deleteAndCleanup(userId, emailParam, phoneParam) {
        if (userId) {
            // Delete associated data by userId
            const tables = [
                { name: 'businesses', col: 'owner_id' },
                { name: 'ca_clients', col: 'ca_id' },
                { name: 'invitations', col: 'ca_id' },
                { name: 'notifications', col: 'user_id' },
                { name: 'reminders', col: 'user_id' }
            ];

            tables.forEach(t => {
                db.run(`DELETE FROM ${t.name} WHERE ${t.col} = ?`, [userId], (err) => {
                    if (err) console.error(`Error deleting from ${t.name}:`, err.message);
                });
            });

            // Delete User
            db.run(`DELETE FROM users WHERE id = ?`, [userId], function(err) {
                if (err) console.error('Error deleting user:', err.message);
                else console.log(`Deleted user by ID. Rows affected: ${this.changes}`);
            });
        }
        
        // Failsafe: blind delete by email too
        db.run(`DELETE FROM users WHERE email = ?`, [emailParam], function(err) {
            if (!err && this.changes > 0) {
                console.log(`Deleted user by email. Rows affected: ${this.changes}`);
            }
        });

        // We can't guarantee 'phone' exists. Catch error silently if it does not.
        db.run(`DELETE FROM users WHERE phone = ?`, [phoneParam], function(err) {
            if (!err && this.changes > 0) {
                console.log(`Deleted user by phone. Rows affected: ${this.changes}`);
            }
        });
        
        console.log('Cleanup script finished dispatching commands.');
    }
});

// Close DB connection after a tiny delay
setTimeout(() => {
    db.close();
}, 2000);
