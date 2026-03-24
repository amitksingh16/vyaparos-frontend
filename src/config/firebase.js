const admin = require('firebase-admin');

// Note: To run this in production, create a serviceAccountKey.json 
// from your Firebase Console (Project Settings -> Service Accounts)
// and place it securely, or load via ENV variables.

let initialized = false;

try {
    // We try to initialize using the default application credentials
    // If running server-side without a JSON file, provide credentials via ENV:
    // GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
    
    // Alternatively, for dev fallback:
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    
    if (serviceAccountPath) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        initialized = true;
        console.log('[FIREBASE] Admin SDK Initialized Successfully');
    } else {
        console.warn('[FIREBASE] Admin SDK requires FIREBASE_SERVICE_ACCOUNT_PATH in .env for full verification.');
    }
} catch (e) {
    console.error('[FIREBASE] Admin SDK Init Error:', e.message);
}

const verifyIdToken = async (idToken) => {
    if (!initialized) {
        // Mock fallback for Dev testing if credentials aren't provided by the user yet
        console.warn('[FIREBASE MOCK] Verifying fake idToken for development.');
        if(idToken === 'mock_token_123') return { phone_number: '+919999999999', uid: 'mock_uid' };
        throw new Error('Firebase Admin not initialized with credentials.');
    }
    return await admin.auth().verifyIdToken(idToken);
};

module.exports = {
    admin,
    verifyIdToken,
    isInitialized: () => initialized
};
