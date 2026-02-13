const express = require('express');
const router = express.Router();
const UserController = require('../controller/user.controller');
const isAuthenticated = require('../middleware/isAuthenticated');

router.get('/users', isAuthenticated, UserController.getUsers);
router.delete('/users/:id', isAuthenticated, UserController.deleteUserById);

module.exports = router;
