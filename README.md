# Property Listing & Recommendation API

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-blue)
![Redis](https://img.shields.io/badge/Redis-7.0-red)

A robust backend API for property listings with advanced search, user authentication, favorites management, and property recommendation features. Designed for real estate platforms to manage properties and user interactions efficiently.

## Key Features

- 🔐 **User Authentication**: Secure JWT-based registration/login
- 🏠 **Property Management**: Full CRUD operations with ownership validation
- 🔍 **Advanced Search**: 10+ filter parameters for property discovery
- ⚡ **Performance Optimized**: Redis caching for frequent operations
- ❤️ **Favorites System**: Save and manage favorite properties
- 📬 **Recommendation Engine**: Share properties with other users

## Technology Stack

- **Runtime**: Node.js 18.x
- **Framework**: Express 4.x
- **Database**: MongoDB (with Mongoose ODM)
- **Caching**: Redis 7.x
- **Authentication**: JWT
- **API Documentation**: OpenAPI (Swagger)
- **Testing**: Jest, Supertest

## API Documentation

[![Swagger API Docs](https://img.shields.io/badge/View-Full%20API%20Documentation-blue)](https://your-deployed-url/api-docs)

### Authentication Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/register` | POST | Register new user | No |
| `/api/auth/login` | POST | User login | No |
| `/api/auth/me` | GET | Get current user | Yes |
| `/api/auth/logout` | POST | Logout user | Yes |

### Property Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/properties` | POST | Create new property | Yes |
| `/api/properties` | GET | Search properties with filters | No |
| `/api/properties/:id` | GET | Get property by ID | No |
| `/api/properties/:id` | PATCH | Update property | Yes (Owner) |
| `/api/properties/:id` | DELETE | Delete property | Yes (Owner) |

### Favorite Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/favorites` | GET | Get user's favorites | Yes |
| `/api/favorites/:propertyId` | POST | Add to favorites | Yes |
| `/api/favorites/:propertyId` | DELETE | Remove from favorites | Yes |

### Recommendation Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/recommendations/search-users` | GET | Search users by email | Yes |
| `/api/recommendations/send` | POST | Send property recommendation | Yes |
| `/api/recommendations/received` | GET | Get received recommendations | Yes |
| `/api/recommendations/sent` | GET | Get sent recommendations | Yes |
| `/api/recommendations/:id/read` | PATCH | Mark as read | Yes |
| `/api/recommendations/:id` | DELETE | Delete recommendation | Yes |

## Getting Started

### Prerequisites

- Node.js 18.x
- MongoDB 7.0+
- Redis 7.x
- NPM 9.x+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/property-api.git
cd property-api
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/property_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_strong_secret_here
PORT=3000
```

4. Start the development server:
```bash
npm run dev
```

### Testing
```bash
# Run unit tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Advanced Search Parameters

Search properties with any combination of these filters:

```http
GET /api/properties?search=luxury&minPrice=100000&maxPrice=500000
&type=villa&minArea=2000&maxArea=5000&bedrooms=4&bathrooms=3
&furnished=true&state=California&city=Los Angeles&listingType=sale
&minRating=4&isVerified=true&tags=luxury|pool&availableFrom=2024-01-01
&sortBy=price&sortOrder=desc&page=1&limit=10
```

## Deployment

### Environment Setup
```bash
# Production build
npm run build

# Start production server
npm start
```

### Docker Deployment
```bash
docker build -t property-api .
docker run -p 3000:3000 -d property-api
```

## Database Schema

### Property Model
```javascript
{
  _id: String,          // Format: PROP123
  title: String,
  description: String,
  price: Number,
  type: String,          // ['apartment', 'house', 'villa', ...]
  areaSqFt: Number,
  bedrooms: Number,
  bathrooms: Number,
  furnished: Boolean,
  state: String,
  city: String,
  listedBy: String,      // Reference to User's listedBy field
  listingType: String,   // ['sale', 'rent']
  rating: Number,
  isVerified: Boolean,
  tags: [String],
  availableFrom: Date,
  images: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Recommendation Model
```javascript
{
  property: String,      // Property ID
  fromUser: ObjectId,    // Sender user ID
  toUser: ObjectId,      // Recipient user ID
  message: String,
  isRead: Boolean,       // Default: false
  createdAt: Date,
  updatedAt: Date
}
```

## Caching Strategy

Redis is used to optimize these operations:

| Operation | Cache Key Pattern | TTL |
|-----------|-------------------|-----|
| Property Search | `properties:<query_hash>` | 5 min |
| Single Property | `property:<id>` | 10 min |
| User Favorites | `favorites:<userId>` | 5 min |
| Recommendations | `recommendations:received:<userId>` | 5 min |

Cache is automatically invalidated on:
- Property create/update/delete
- Favorite add/remove
- Recommendation send/mark read/delete

## Rate Limiting

The API is protected with rate limiting:
- 100 requests per IP every 15 minutes
- Exceptions applied to authentication endpoints

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
