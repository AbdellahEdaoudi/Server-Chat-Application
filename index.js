require('dotenv').config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const cors = require('cors');
app.use(express.json());
const MessageController = require("./controller/msg.controller")
const UserController = require("./controller/user.controller")
const isAuthenticated = require('./middleware/isAuthenticated');
const PORT = 2222;


app.use(cors());
const io = socketIo(server, {
  cors: {
    origin: "https://edchatflow.vercel.app",
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

// Socket.io
io.on('connection', (socket) => {
  console.log(`A user connected with id: ${socket.id}.`);
  
  // Messages
  socket.on('sendMessage', (data) => {
    io.emit('receiveMessage', data);
  });
  socket.on('updateMessage', (data) => {
    io.emit('receiveUpdatedMessage', data);
  });
  socket.on('deleteMessage', (id) => {
    io.emit('receiveDeletedMessage', id);
  });
  

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });

});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


const allowedOrigins = ['https://edchatflow.vercel.app', 'http://localhost:3000'];
app.use((req, res, next) => {
  const origin = req.headers.origin; 
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log(`Connect to Mongodb Atlas`);
  })
  .catch(err => {
    console.error(err);
  });


// User Routes
app.get('/users',isAuthenticated,UserController.getUsers);
app.get('/users/:id',isAuthenticated,UserController.getUserById);
app.get('/usersE/:email',isAuthenticated,UserController.getUserByEmail);
app.get('/user/:username',isAuthenticated,UserController.getUserByFullname);
app.post('/users',isAuthenticated,UserController.createUser);
app.put('/usersE/:email',isAuthenticated,UserController.updateUserByEmail);
app.delete('/users/:id',isAuthenticated,UserController.deleteUserById);

// Message routes
app.get('/messages',isAuthenticated,MessageController.getMessages);
app.get('/messages/:id',isAuthenticated,MessageController.getMessageById);
app.post('/messages',isAuthenticated,MessageController.createMessage);
app.put('/messages/:id',isAuthenticated,MessageController.updateMessageById);
app.put('/readorno',isAuthenticated,MessageController.updateReadOrNoForMessages);
app.delete('/messages/:id',isAuthenticated,MessageController.deleteMessageById);
app.delete('/messages',isAuthenticated,MessageController.deleteAllMessages);
app.delete('/messages_B_U',isAuthenticated,MessageController.deleteMessagesBetweenUsers);


app.delete("/dm",isAuthenticated,async (req, res) => {
  try {
    const result = await Messages.deleteMany({});
    res.status(200).json({ message: "All Messages have been deleted.", result });
  } catch (error) {
    res.status(500).json({ message: "An error occurred while deleting links.", error });
  }
});
 