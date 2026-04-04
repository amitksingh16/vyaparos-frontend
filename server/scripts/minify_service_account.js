/**
 * Run this script to convert your Firebase service account JSON
 * to a single-line string suitable for Railway env variables.
 *
 * Usage:
 *   node scripts/minify_service_account.js <path-to-downloaded-key.json>
 *
 * Example:
 *   node scripts/minify_service_account.js C:\Users\singh\Downloads\vyaparos-prod-firebase-adminsdk.json
 *
 * Copy the output and paste it as the value of FIREBASE_SERVICE_ACCOUNT in Railway.
 */

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath) {
    console.error('❌ Please provide the path to your service account JSON file.');
    console.error('   Usage: node scripts/minify_service_account.js <path-to-file.json>');
    process.exit(1);
}

try {
    const raw = fs.readFileSync(path.resolve(filePath), 'utf8');
    const parsed = JSON.parse(raw);

    // Validate it looks like a service account key
    if (!parsed.type || parsed.type !== 'service_account') {
        console.error('❌ This does not look like a Firebase service account key (missing "type": "service_account").');
        process.exit(1);
    }

    const minified = JSON.stringify(parsed);
    console.log('\n✅ Copy the line below and paste it as FIREBASE_SERVICE_ACCOUNT in Railway:\n');
    console.log('━'.repeat(60));
    console.log(minified);
    console.log('━'.repeat(60));
    console.log(`\nProject ID detected: ${parsed.project_id}`);
    console.log(`Client Email: ${parsed.client_email}`);
    console.log('\n⚠️  Keep this key secret. Do NOT commit this file to git.\n');
} catch (err) {
    console.error('❌ Error reading file:', err.message);
    process.exit(1);
}
