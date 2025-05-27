const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const auth = require('../middleware/auth');
const redisClient = require('../config/redis');

// Create new property
router.post('/', auth, async (req, res) => {
    try {
        const property = new Property({
            ...req.body,
            listedBy: req.user.listedBy // Use listedBy from user
        });
        await property.save();
        
        // Invalidate cache
        await redisClient.del('properties:*');
        
        res.status(201).json(property);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all properties with advanced search
router.get('/', async (req, res) => {
    try {
        const {
            search,
            minPrice,
            maxPrice,
            type,
            minArea,
            maxArea,
            bedrooms,
            bathrooms,
            furnished,
            state,
            city,
            listedBy,
            listingType,
            minRating,
            isVerified,
            tags,
            availableFrom,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        // Build query
        const query = {};
        
        if (search) {
            query.$text = { $search: search };
        }
        
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        
        if (type) query.type = type;
        if (minArea || maxArea) {
            query.areaSqFt = {};
            if (minArea) query.areaSqFt.$gte = Number(minArea);
            if (maxArea) query.areaSqFt.$lte = Number(maxArea);
        }
        if (bedrooms) query.bedrooms = Number(bedrooms);
        if (bathrooms) query.bathrooms = Number(bathrooms);
        if (furnished) query.furnished = furnished;
        if (state) query.state = new RegExp(state, 'i');
        if (city) query.city = new RegExp(city, 'i');
        if (listedBy) query.listedBy = listedBy;
        if (listingType) query.listingType = listingType;
        if (minRating) query.rating = { $gte: Number(minRating) };
        if (isVerified !== undefined) query.isVerified = isVerified === 'true';
        if (tags) {
            const tagArray = tags.split('|');
            query.tags = { $regex: tagArray.join('|'), $options: 'i' };
        }
        if (availableFrom) {
            query.availableFrom = { $gte: availableFrom };
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Try to get from cache first
        const cacheKey = `properties:${JSON.stringify(query)}:${sortBy}:${sortOrder}:${page}:${limit}`;
        const cachedResult = await redisClient.get(cacheKey);
        
        if (cachedResult) {
            return res.json(JSON.parse(cachedResult));
        }

        // Get results from database
        const [properties, total] = await Promise.all([
            Property.find(query)
                .sort(sort)
                .skip(skip)
                .limit(Number(limit)),
            Property.countDocuments(query)
        ]);

        const result = {
            properties,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit)
        };

        // Cache the result
        await redisClient.set(cacheKey, JSON.stringify(result), {
            EX: 300 // Cache for 5 minutes
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single property
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
            
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        
        res.json(property);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update property
router.patch('/:id', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        
        // Check if user is authorized (same listedBy as property)
        if (property.listedBy !== req.user.listedBy) {
            return res.status(403).json({ message: 'Not authorized to update this property' });
        }
        
        Object.assign(property, req.body);
        await property.save();
        
        // Invalidate cache
        await redisClient.del('properties:*');
        
        res.json(property);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete property
router.delete('/:id', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        
        // Check if user is authorized (same listedBy as property)
        if (property.listedBy !== req.user.listedBy) {
            return res.status(403).json({ message: 'Not authorized to delete this property' });
        }
        
        await property.deleteOne();
        
        // Invalidate cache
        await redisClient.del('properties:*');
        
        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 