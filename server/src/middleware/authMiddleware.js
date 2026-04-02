const jwt = require('jsonwebtoken');

const { verifyIdToken } = require('../config/firebase');
const { User } = require('../models');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
        
        try {
            console.log("Received token:", token);
            // First attempt to decode as a native Firebase Token
            const decodedFirebase = await verifyIdToken(token);
            console.log("Decoded token:", decodedFirebase.uid);
            const user = await User.findOne({ where: { firebase_uid: decodedFirebase.uid } });
            
            if (user) {
                req.user = { id: user.id, role: user.role };
                return next();
            } else {
                return res.status(401).json({ message: 'Firebase identity not bridged to local user' });
            }
        } catch (firebaseError) {
            console.error('Firebase Auth verification failed:', firebaseError.message);
            return res.status(401).json({ message: 'Not authorized, invalid Firebase ID token' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
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
