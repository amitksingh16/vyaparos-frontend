const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('database.sqlite');
db.all('SELECT * FROM users', (err, rows) => {
    fs.writeFileSync('output_users.json', JSON.stringify(rows, null, 2));
    console.log('Saved to output_users.json');
});
