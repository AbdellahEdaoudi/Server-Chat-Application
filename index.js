require('dotenv').config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const cookieParser = require('cookie-parser');
const initializeSocket = require('./socket/socket');

const PORT = 2222;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://edchatflow.vercel.app",
    "https://zona-unadamant-unoffensively.ngrok-free.dev",
    "http://192.168.1.106:3000"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const io = initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log(`Connect to Mongodb Atlas`);
  })
  .catch(err => {
    console.error(err);
  });

// Use Routes
app.use('/', require('./routes/auth.routes'));
app.use('/', require('./routes/user.routes'));
app.use('/', require('./routes/message.routes'));

// Test route (optional to keep here or move)
const Messages = require('./models/Messages');
app.get('/test', async (req, res) => {
  const messages = await Messages.find({
    $or: [
      { from: "698b9ee28e75b90f18798e06" },
      { to: "698b9f408e75b90f18798e29" }
    ]
  }).populate('from to', '-__v -updatedAt -createdAt -protectedPrivateKey').populate({
    path: 'replyTo',
    populate: { path: 'from', select: 'fullname' }
  });
  res.json(messages);
});