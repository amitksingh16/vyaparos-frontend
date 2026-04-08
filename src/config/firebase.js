const admin = require("firebase-admin");

let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    // Replace string literals \n with actual newline characters
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('[FIREBASE] Init successful. Project:', serviceAccount.project_id);
    }
} else {
    console.warn("FIREBASE_SERVICE_ACCOUNT environment variable is not defined");
}

const verifyIdToken = async (idToken) => {
    if (serviceAccount) {
        console.log("PROJECT ID:", serviceAccount.project_id);
    }
    
    try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        console.log("DECODED:", decoded);
        return decoded;
    } catch (err) {
        console.error("VERIFY ERROR FULL:", err);
        throw err;
    }
};

module.exports = {
    admin,
    verifyIdToken,
    isInitialized: () => admin.apps.length > 0,
};
