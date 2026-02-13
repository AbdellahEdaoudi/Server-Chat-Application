require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Messages = require('./models/Messages');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
    .then(async () => {
        console.log('✅ Connected to MongoDB Atlas');

        try {
            // await Message.deleteMany({});
            // await User.deleteMany({});
        } catch (error) {
            console.error('❌ Error deleting users:', error);
            await mongoose.connection.close();
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('❌ Error connecting to MongoDB:', err);
        process.exit(1);
    });
