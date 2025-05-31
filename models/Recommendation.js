const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    property: {
        type: String,
        ref: 'Property',
        required: true
    },
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    toUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
recommendationSchema.index({ toUser: 1, createdAt: -1 });
recommendationSchema.index({ fromUser: 1, createdAt: -1 });

module.exports = mongoose.model('Recommendation', recommendationSchema); 