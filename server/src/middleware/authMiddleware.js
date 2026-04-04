const jwt = require('jsonwebtoken');

const { admin: firebaseAdmin } = require('../config/firebase');
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
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        console.log("RECEIVED TOKEN:", token);
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        console.log("DECODED TOKEN:", decodedToken);

        const user = await User.findOne({ where: { firebase_uid: decodedToken.uid } });
        
        if (user) {
            req.user = { id: user.id, role: user.role };
            return next();
        } else {
            return res.status(401).json({ message: 'Firebase identity not bridged to local user' });
        }
    } catch (firebaseError) {
        console.error('Firebase Auth verification failed:', firebaseError.message);
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
