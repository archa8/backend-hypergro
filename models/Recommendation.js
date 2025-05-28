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

// GET /api/recommendations/search-users?email=user@example.com
/* POST /api/recommendations/send
{
  "propertyId": "PROP123",
  "toUserId": "user_id",
  "message": "I think you might like this property!"
}
*/
// GET /api/recommendations/received
// GET /api/recommendations/sent
// PATCH /api/recommendations/:id/read
// DELETE /api/recommendations/:id

/* Search for a user to recommend to:
curl -X GET "http://localhost:3000/api/recommendations/search-users?email=john@example.com" \
-H "Authorization: Bearer your_jwt_token"
*/

/* Send a recommendation:
curl -X POST "http://localhost:3000/api/recommendations/send" \
-H "Authorization: Bearer your_jwt_token" \
-H "Content-Type: application/json" \
-d '{
    "propertyId": "PROP123",
    "toUserId": "user_id",
    "message": "This property matches your requirements!"
}'
*/

/* Get received recommendations:
curl -X GET "http://localhost:3000/api/recommendations/received" \
-H "Authorization: Bearer your_jwt_token"
*/