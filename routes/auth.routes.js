const express = require('express');
const router = express.Router();
const AuthController = require('../controller/auth.controller');
const upload = require('../utils/multer');
const isAuthenticated = require('../middleware/isAuthenticated');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: { message: "Too many login attempts, please try again after 10 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: { message: "Too many registration attempts, please try again after an hour" },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/register', registerLimiter, upload.single('profileImage'), AuthController.register);
router.post('/login', loginLimiter, AuthController.login);
router.post('/logout', AuthController.logout);
router.put('/update-profile', isAuthenticated, upload.single('profileImage'), AuthController.updateProfile);

module.exports = router;
