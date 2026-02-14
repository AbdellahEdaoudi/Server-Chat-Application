const express = require('express');
const router = express.Router();
const UserController = require('../controller/user.controller');
const isAuthenticated = require('../middleware/isAuthenticated');
const rateLimit = require('express-rate-limit');

const statusLimiter = rateLimit({
    windowMs: 20 * 60 * 1000, // 20 minutes
    max: 10,
    message: { message: "Too many status updates, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

router.get('/users', isAuthenticated, UserController.getUsers);
router.put('/update_status', statusLimiter, isAuthenticated, UserController.updateStatus);
router.delete('/users/:id', isAuthenticated, UserController.deleteUserById);

module.exports = router;
