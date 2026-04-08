const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.all("SELECT id, name, email, phone FROM Users", function(err, rows) {
    if (err) {
        // Retry with lowercase users
        db.all("SELECT id, name, email, phone FROM users", function(err2, rows2) {
             if (err2) {
                  console.error('Error selecting users:', err2.message);
             } else {
                  console.log('users data:', rows2);
             }
        });
    } else {
      console.log('Users data:', rows);
    }
  });
});

db.close();
