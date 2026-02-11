require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Messages = require('./models/Messages');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
    .then(async () => {
        console.log('✅ Connected to MongoDB Atlas');

        try {
            // Delete all users
            const result = await Messages.deleteMany({});
            const result2 = await User.deleteMany({});
            console.log(`🗑️  Deleted ${result.deletedCount} messages(s)`);
            console.log(`🗑️  Deleted ${result2.deletedCount} user(s)`);

            // Close connection
            await mongoose.connection.close();
            console.log('✅ Connection closed');
            process.exit(0);
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
