require('dotenv').config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const cookieParser = require('cookie-parser');
const Messages = require('./models/Messages');
const upload = require('./utils/multer');
const MessageController = require("./controller/msg.controller")
const UserController = require("./controller/user.controller")
const AuthController = require("./controller/auth.controller")
const isAuthenticated = require('./middleware/isAuthenticated');
const PORT = 2222;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:3000", "https://edchatflow.vercel.app"," https://zona-unadamant-unoffensively.ngrok-free.dev"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
const initializeSocket = require('./socket/socket');
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

// Auth Routes
app.post('/register', upload.single('profileImage'), AuthController.register);
app.post('/login', AuthController.login);
app.post('/logout', AuthController.logout);
app.put('/update-profile', isAuthenticated, upload.single('profileImage'), AuthController.updateProfile);

// User Routes
app.get('/users', isAuthenticated, UserController.getUsers);
app.delete('/users/:id', UserController.deleteUserById);

// Message routes
app.post('/get_messages', isAuthenticated, MessageController.getMessages);
app.post('/messages', isAuthenticated, MessageController.createMessage);
app.put('/messages/:id', isAuthenticated, MessageController.updateMessageById);
app.delete('/messages/:id', isAuthenticated, MessageController.deleteMessageById);
app.put('/readorno', isAuthenticated, MessageController.updateReadOrNoForMessages);
app.delete('/delete_messages_between_users', isAuthenticated, MessageController.deleteMessagesBetweenUsers);

app.get('/test', async (req, res) => {
  const messages = await Messages.find().populate('from to', '-__v -updatedAt -createdAt');
  res.json(messages);
});