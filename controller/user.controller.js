const User = require('../models/User');


// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-createdAt -__v -updatedAt")
      .collation({ locale: 'en', strength: 1 })
      .sort({ fullname: 1 })
      .limit(5);

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Update status manually
exports.updateStatus = async (req, res) => {
  const userId = req.user.id;
  const { isOnline } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, { isOnline }, { returnDocument: 'after' });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ success: true, isOnline: updatedUser.isOnline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user by ID
exports.deleteUserById = async (req, res) => {
  const id = req.user.id
  try {
    const deletedUser = await User.findByIdAndDelete({ _id: id });
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
