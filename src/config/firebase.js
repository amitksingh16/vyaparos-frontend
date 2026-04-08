const admin = require('firebase-admin');

// Firebase Admin SDK initialization — uses FIREBASE_SERVICE_ACCOUNT env variable.
// The env var must contain the full JSON service account string.

let initialized = false;

try {
    // Guard: only initialize once even if this module is required from multiple files
    if (!admin.apps.length) {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (serviceAccountJson) {
            const serviceAccount = JSON.parse(serviceAccountJson);

            // FIX: Environment variables store literal "\n" as two characters (backslash + n).
            // Firebase private keys require actual newline characters for PEM parsing.
            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            initialized = true;
            console.log('[FIREBASE] Admin SDK Initialized Successfully from ENV');
            console.log('[FIREBASE] Project:', serviceAccount.project_id);
        } else {
            console.warn('[FIREBASE] Admin SDK requires FIREBASE_SERVICE_ACCOUNT json string in .env');
        }
    } else {
        // Already initialized by a previous require()
        initialized = true;
        console.log('[FIREBASE] Admin SDK already initialized (reused existing app)');
    }
} catch (e) {
    console.error('[FIREBASE] Admin SDK Init Error:', e.message);
}

const verifyIdToken = async (idToken) => {
    if (!initialized) {
        console.warn('[FIREBASE MOCK] Verifying fake idToken for development.');
        if (idToken === 'mock_token_123') return { phone_number: '+919999999999', uid: 'mock_uid' };
        throw new Error('Firebase Admin not initialized with credentials.');
    }
    return await admin.auth().verifyIdToken(idToken);
};

module.exports = {
    admin,
    verifyIdToken,
    isInitialized: () => initialized,
};
