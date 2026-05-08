const User = require('../models/User');
const Messages = require('../models/Messages');

// 1. Get dashboard stats
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalMessages = await Messages.countDocuments();
        const activeUsers = await User.countDocuments({ isOnline: true });
        
        // Count users created in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const newUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

        res.status(200).json({
            totalUsers,
            totalMessages,
            activeUsers,
            newUsers
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: "Error fetching stats", error: error.message });
    }
};

// 2. Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -protectedPrivateKey -publicKey').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

// 3. Delete user
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Don't allow admins to delete themselves
        if (userId === req.user.id) {
            return res.status(400).json({ message: "You cannot delete yourself." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await User.findByIdAndDelete(userId);
        
        // Optionally, delete their messages too
        await Messages.deleteMany({ $or: [{ from: userId }, { to: userId }] });

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
};

// 4. Toggle admin status
exports.toggleUserRole = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Don't allow admins to change their own role here
        if (userId === req.user.id) {
            return res.status(400).json({ message: "You cannot change your own role." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isAdmin = !user.isAdmin;
        await user.save();

        res.status(200).json({ message: "User role updated successfully", user: { id: user._id, isAdmin: user.isAdmin } });
    } catch (error) {
        res.status(500).json({ message: "Error updating user role", error: error.message });
    }
};
