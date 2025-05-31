const mongoose = require('mongoose');
const Counter = require('./models/Counter');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Initialize counter to 1999 (next will be 2000)
  await Counter.findByIdAndUpdate(
    'propertyId',
    { $set: { seq: 1999 } },
    { upsert: true }
  );
  
  console.log('Counter initialized to 1999');
  process.exit(0);
})
.catch(err => {
  console.error('Initialization failed:', err);
  process.exit(1);
});