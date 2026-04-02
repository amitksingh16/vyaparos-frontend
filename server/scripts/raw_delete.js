const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run("DELETE FROM Users WHERE email = 'singh.amitk82@gmail.com'", function(err) {
    if (err) {
      console.error('Error deleting by email:', err.message);
    } else {
      console.log(`Row(s) deleted by email: ${this.changes}`);
    }
  });

  db.run("DELETE FROM Users WHERE phone = '9554140800'", function(err) {
    if (err) {
      console.error('Error deleting by phone:', err.message);
    } else {
      console.log(`Row(s) deleted by phone: ${this.changes}`);
    }
  });
});

db.close();
