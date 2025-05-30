const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        /* const user = await User.findOne({ _id: decoded.userId }); */
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            throw new Error();
        }

        req.user = {
            _id: user._id,
            listedBy: user.listedBy  // Include the role
        };
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate.' });
    }
};

module.exports = auth; 