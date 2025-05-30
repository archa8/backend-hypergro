const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Bungalow', 'Apartment', 'Villa', 'House', 'Plot']
    },
    price: {
        type: Number,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    areaSqFt: {
        type: Number,
        required: true
    },
    bedrooms: {
        type: Number,
        required: true
    },
    bathrooms: {
        type: Number,
        required: true
    },
    amenities: {
        type: String,
        required: true,
        validate: {
            validator: (v) => v.split('|').length > 0, // Ensure at least one amenity
            message: 'Amenities must be a pipe-separated string'
        }
    },
    furnished: {
        type: String,
        enum: ['Furnished', 'Unfurnished', 'Semi'],
        required: true
    },
    availableFrom: {
        type: Date,
        required: true
    },
    listedBy: {
        type: String,
        enum: ['Builder', 'Owner', 'Agent'],
        required: true
    },
    tags: {
        type: String,
        required: true,
        validate: {
            validator: (v) => v.split('|').length > 0, // Ensure at least one tag
            message: 'Tags must be a pipe-separated string'
        }
    },
    colorTheme: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    listingType: {
        type: String,
        enum: ['rent', 'sale'],
        required: true
    }
}, {
    timestamps: true
});

// Index for text search
propertySchema.index({
    title: 'text',
    state: 'text',
    city: 'text',
    type: 'text',
    tags: 'text'
});

// Compound indexes for common queries
propertySchema.index({ state: 1, city: 1 });
propertySchema.index({ type: 1, listingType: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ rating: -1 });
propertySchema.index({ listedBy: 1 });

module.exports = mongoose.model('Property', propertySchema, 'property'); 