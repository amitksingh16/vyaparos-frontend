const admin = require('../config/firebaseAdmin');
const { User } = require('../models');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        console.log('[AUTH] No token provided. Header:', req.headers.authorization);
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        console.log('[AUTH] AUTH HEADER:', req.headers.authorization);
        console.log('[AUTH] TOKEN:', token?.substring(0, 30) + '...');

        const decoded = await admin.auth().verifyIdToken(token);
        console.log("DECODED:", decoded);

        const user = await User.findOne({ where: { firebase_uid: decoded.uid } });

        if (user) {
            req.user = { id: user.id, role: user.role };
            return next();
        } else {
            console.warn('[AUTH] Firebase UID not linked to any local user:', decoded.uid);
            return res.status(401).json({ message: 'Firebase identity not bridged to local user' });
        }
    } catch (err) {
        console.error("VERIFY ERROR FULL:", err);
        return res.status(401).json({ message: 'Invalid Firebase token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
