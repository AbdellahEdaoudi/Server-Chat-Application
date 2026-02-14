require('dotenv').config();
const express = require("express");
const app = express();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const cookieParser = require('cookie-parser');
const initializeSocket = require('./socket/socket');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require("./config/dbConnect");
const corsOptions = require("./config/corsOptions");

const PORT = 2222;

connectDB();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Manual sanitization to avoid Express 5 Read-only property error on req.query
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

app.use(cookieParser());
app.use(cors(corsOptions));

const io = initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Use Routes
app.use('/', require('./routes/auth.routes'));
app.use('/', require('./routes/user.routes'));
app.use('/', require('./routes/message.routes'));