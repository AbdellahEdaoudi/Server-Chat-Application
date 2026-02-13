const express = require('express');
const router = express.Router();
const MessageController = require('../controller/msg.controller');
const isAuthenticated = require('../middleware/isAuthenticated');
const rateLimit = require('express-rate-limit');

const messageLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: { message: "Too many messages sent, please slow down" },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/get_messages', isAuthenticated, MessageController.getMessages);
router.post('/messages', messageLimiter, isAuthenticated, MessageController.createMessage);
router.put('/messages/:id', isAuthenticated, MessageController.updateMessageById);
router.delete('/messages/:id', isAuthenticated, MessageController.deleteMessageById);
router.put('/readorno', isAuthenticated, MessageController.updateReadOrNoForMessages);
router.delete('/delete_messages_between_users', isAuthenticated, MessageController.deleteMessagesBetweenUsers);

module.exports = router;
