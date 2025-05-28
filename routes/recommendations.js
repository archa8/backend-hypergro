const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Property = require('../models/Property');
const Recommendation = require('../models/Recommendation');
const auth = require('../middleware/auth');

// Search for users by email
router.get('/search-users', auth, async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Search for users by email (excluding current user)
        const users = await User.find({
            email: { $regex: email, $options: 'i' },
            _id: { $ne: req.user._id }
        }).select('email listedBy');

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Send property recommendation
router.post('/send', auth, async (req, res) => {
    try {
        const { propertyId, toUserId, message } = req.body;

        // Validate property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Validate recipient exists
        const recipient = await User.findById(toUserId);
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        // Create recommendation
        const recommendation = new Recommendation({
            property: propertyId,
            fromUser: req.user._id,
            toUser: toUserId,
            message
        });

        await recommendation.save();

        res.status(201).json(recommendation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get recommendations received by current user
router.get('/received', auth, async (req, res) => {
    try {
        const recommendations = await Recommendation.find({ toUser: req.user._id })
            .populate('fromUser', 'email listedBy')
            .populate('property')
            .sort({ createdAt: -1 });

        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get recommendations sent by current user
router.get('/sent', auth, async (req, res) => {
    try {
        const recommendations = await Recommendation.find({ fromUser: req.user._id })
            .populate('toUser', 'email listedBy')
            .populate('property')
            .sort({ createdAt: -1 });

        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark recommendation as read
router.patch('/:id/read', auth, async (req, res) => {
    try {
        const recommendation = await Recommendation.findOne({
            _id: req.params.id,
            toUser: req.user._id
        });

        if (!recommendation) {
            return res.status(404).json({ message: 'Recommendation not found' });
        }

        recommendation.isRead = true;
        await recommendation.save();

        res.json(recommendation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete recommendation
router.delete('/:id', auth, async (req, res) => {
    try {
        const recommendation = await Recommendation.findOne({
            _id: req.params.id,
            $or: [
                { fromUser: req.user._id },
                { toUser: req.user._id }
            ]
        });

        if (!recommendation) {
            return res.status(404).json({ message: 'Recommendation not found' });
        }

        await recommendation.deleteOne();
        res.json({ message: 'Recommendation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 