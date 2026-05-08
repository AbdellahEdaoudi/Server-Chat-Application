const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/isAuthenticated');
const isAdmin = require('../middleware/isAdmin');
const adminController = require('../controller/admin.controller');

// Apply middlewares to all routes in this file
router.use(isAuthenticated);
router.use(isAdmin);

// 1. Get dashboard stats
router.get('/admin/stats', adminController.getStats);

// 2. Get all users
router.get('/admin/users', adminController.getAllUsers);

// 3. Delete user
router.delete('/admin/users/:id', adminController.deleteUser);

// 4. Toggle admin status
router.put('/admin/users/:id/role', adminController.toggleUserRole);

module.exports = router;
