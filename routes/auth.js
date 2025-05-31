const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, listedBy } = req.body;

        const validRoles = {
            'builder': 'Builder',
            'owner': 'Owner',
            'agent': 'Agent'
        };
        const normalizedRole = validRoles[listedBy.toLowerCase()];

        // Validate listedBy
        /*if (!['Builder', 'Owner', 'Agent'].includes(listedBy)) {
            return res.status(400).json({ message: 'Invalid user role' });
        }*/
        if (!normalizedRole) {
            return res.status(400).json({ message: 'Invalid user role' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        /* const user = new User({ email, password, listedBy }); */
        const user = new User({ 
            email, 
            password, 
            listedBy: normalizedRole
        });
        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ user, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get current user
router.get('/me', auth, (req, res) => {
    res.json(req.user);
});

// Logout user
router.post('/logout', auth, (req, res) => {
    res.json({ message: 'Successfully logged out.' });
});

module.exports = router; 