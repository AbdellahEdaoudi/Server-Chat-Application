require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Messages = require('./models/Messages');

mongoose.connect(process.env.MONGO_URL)
    .then(async () => {
        console.log('Connected to MongoDB Atlas');
        const Msgs = await Messages.find({}, "from to message")
        .populate("from to", "username _id password");
        console.log("Messages :");
        console.log(Msgs.splice(0, 2));
    })
    .catch(err => {
        console.error('Error connecting to MongoDB Atlas');
    });
