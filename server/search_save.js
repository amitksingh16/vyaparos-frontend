const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.all("SELECT id, name, email, phone FROM users", function(err, rows) {
    if (err) {
      console.error(err);
    } else {
      const matches = rows.filter(r => 
        (r.email && r.email.includes('singh.amit')) || 
        (r.phone && r.phone.includes('9554')) ||
        (r.email === 'singh.amitk82@gmail.com') ||
        (r.phone === '9554140800')
      );
      fs.writeFileSync('./debug_output.json', JSON.stringify({ total: rows.length, matches }, null, 2));
      console.log('Total users:', rows.length, 'Matches:', matches.length);
    }
  });
});

db.close();
