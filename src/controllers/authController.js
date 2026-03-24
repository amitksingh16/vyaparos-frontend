const { User, ActivityLog } = require('../models');
const { generateToken } = require('../utils/jwtService');
const { verifyIdToken } = require('../config/firebase');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { phone, email, name, role } = req.body;

        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        const userExists = await User.findOne({ where: { phone } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user (unverified)
        const user = await User.create({
            phone,
            email,
            name,
            role: role || 'owner',
            is_verified: false,
        });

        res.status(201).json({
            message: 'User registered. Proceed with Firebase OTP verification.',
            userId: user.id,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        const user = await User.findOne({ where: { phone } });
        if (!user) {
            return res.status(404).json({ message: 'User not found. Please register first.' });
        }

        // Frontend will now trigger Firebase Phone Auth directly
        res.status(200).json({ message: 'User recognized. Trigger Firebase OTP.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Verify OTP and return Token
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    try {
        const { phone, otp, idToken } = req.body;

        if (!phone) {
            return res.status(400).json({ message: 'Phone is required' });
        }

        let decodedToken = null;
        if (idToken) {
            // Live Firebase Validation
            try {
                decodedToken = await verifyIdToken(idToken);
                // We rely on Firebase ensuring this phone number owns the token
            } catch (e) {
                console.error('Firebase Token Verification Failed:', e.message);
                if (idToken !== 'mock_token_123') {
                    return res.status(401).json({ message: 'Invalid or expired Firebase Auth Token' });
                }
            }
        } else if (otp === '123456') {
            // Temporary backward-compatibility loop for local environments lacking credentials
            console.warn('[AUTH] Bypassing Firebase with mock OTP for development.');
        } else {
            return res.status(400).json({ message: 'Provide exactly one of: Firebase idToken or test OTP' });
        }

        let user = null;
        const firebase_uid = decodedToken ? decodedToken.uid : null;

        if (firebase_uid) {
            user = await User.findOne({ where: { firebase_uid } });
        }

        if (!user && phone) {
            user = await User.findOne({ where: { phone } });
            if (user && firebase_uid) {
                // Bridge the identity immediately
                user.firebase_uid = firebase_uid;
                await user.save();
            }
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Mark verified
        if (!user.is_verified) {
            user.is_verified = true;
            await user.save();
        }

        // Log the successful authentication event
        try {
            await ActivityLog.create({
                event_type: 'USER_LOGIN',
                description: `${user.name || 'User'} logged in successfully.`,
                performed_by: user.id
            });
        } catch (err) {
            console.error('Failed to log login activity:', err);
        }

        // Generate Token
        const token = generateToken(user.id, user.role);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                is_verified: user.is_verified,
                setup_completed: user.setup_completed,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }, // No password field in DB anyway, but good practice
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Setup staff account from invite token
// @route   POST /api/auth/staff-setup
// @access  Public
const staffSetup = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: 'Token and password are required' });
        }

        const user = await User.findOne({ where: { invite_token: token } });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired invitation token' });
        }

        // Ideally hash the password, but keeping it simple for dev since original user creation doesn't use passwords
        // We will just store it plain-text for this prototype, or mock a hash
        user.password = password;
        user.invite_status = 'active';
        user.setup_completed = true;
        user.is_verified = true;
        user.invite_token = null; // Consume token

        await user.save();

        const jwtToken = generateToken(user.id, user.role);

        res.status(200).json({
            message: 'Staff account setup successfully',
            token: jwtToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                is_verified: user.is_verified,
                setup_completed: user.setup_completed,
            },
        });
    } catch (error) {
        console.error('Staff setup error:', error);
        res.status(500).json({ message: 'Server error during staff setup' });
    }
};

// @desc    Mock login to verify Staff View (Testing Only)
// @route   POST /api/auth/mock-staff-login
// @access  Public
const mockStaffLogin = async (req, res) => {
    try {
        const { name, role } = req.query;
        let whereClause = { role: role || 'ca_staff' };
        if (name) {
            whereClause.name = name;
        }

        // Find the specific (or first available) staff member or CA
        const staff = await User.findOne({ where: whereClause });
        
        if (!staff) {
            return res.status(404).json({ message: `No user found for query. Please seed first.` });
        }

        // Generate token and fake successful setup
        const token = generateToken(staff.id, staff.role);

        res.status(200).json({
            message: 'Mock staff login successful',
            token,
            user: {
                id: staff.id,
                name: staff.name,
                email: staff.email,
                role: staff.role,
                is_verified: true,
                setup_completed: true,
            },
        });
    } catch (error) {
        console.error('Mock staff login error:', error);
        res.status(500).json({ message: 'Server error generating mock login' });
    }
};

module.exports = {
    register,
    login,
    verifyOtp,
    getProfile,
    staffSetup,
    mockStaffLogin
};
