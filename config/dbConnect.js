const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(process.env.MONGO_URL);
        console.log(`Connect to Mongodb Atlas`);
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
