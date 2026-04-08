const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.all("SELECT name FROM sqlite_master WHERE type='table';", function(err, rows) {
    if (err) {
      console.error(err);
    } else {
      console.log('Tables in database:', rows.map(r => r.name));
    }
  });
});

db.close();
