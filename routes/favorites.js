const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Property = require('../models/Property');
const auth = require('../middleware/auth');

// Get user's favorites
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('favorites');
        res.json(user.favorites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add property to favorites
router.post('/:propertyId?', auth, async (req, res) => {
    try {
        if (req.body.propertyIds) {
            if (!Array.isArray(req.body.propertyIds)) {
                return res.status(400).json({ message: 'propertyIds must be an array' });
            }
            
            const user = await User.findById(req.user._id);
            const properties = await Property.find({ _id: { $in: req.body.propertyIds } });
            const validIds = properties.map(p => p._id.toString());
            
            // Filter out invalid and existing favorites
            const newFavorites = req.body.propertyIds.filter(id => 
                validIds.includes(id) && 
                !user.favorites.includes(id)
            );
            
            if (newFavorites.length === 0) {
                return res.status(400).json({ 
                    message: 'No new valid properties to add',
                    duplicates: req.body.propertyIds.filter(id => user.favorites.includes(id)),
                    invalid: req.body.propertyIds.filter(id => !validIds.includes(id))
                });
            }
            
            user.favorites.push(...newFavorites);
            await user.save();
            
            return res.json({
                message: `Added ${newFavorites.length} properties to favorites`,
                added: newFavorites,
                duplicates: req.body.propertyIds.filter(id => user.favorites.includes(id) && !newFavorites.includes(id)),
                invalid: req.body.propertyIds.filter(id => !validIds.includes(id))
            });
        }
        
        // Handle single property from URL parameter
        const propertyId = req.params.propertyId;
        if (!propertyId) {
            return res.status(400).json({ message: 'Property ID required' });
        }
        
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const user = await User.findById(req.user._id);
        
        if (user.favorites.includes(property._id)) {
            return res.status(400).json({ message: 'Property already in favorites' });
        }

        user.favorites.push(property._id);
        await user.save();

        res.json({ message: 'Property added to favorites' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Remove property from favorites
router.delete('/:propertyId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        // Check if property is in favorites
        if (!user.favorites.includes(req.params.propertyId)) {
            return res.status(400).json({ message: 'Property not in favorites' });
        }

        user.favorites = user.favorites.filter(
            id => id.toString() !== req.params.propertyId
        );
        await user.save();

        res.json({ message: 'Property removed from favorites' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 