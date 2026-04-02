const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.all("SELECT id, name, email, phone FROM users WHERE email LIKE '%singh.amit%' OR phone LIKE '%9554%'", function(err, rows) {
    if (err) {
      console.error(err);
    } else {
      console.log('Search matches:', rows);
    }
  });
});

db.close();
