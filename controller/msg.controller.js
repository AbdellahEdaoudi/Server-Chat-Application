const Messages = require('../models/Messages');
const User = require('../models/User');

// Get messages for a specific user
exports.getMessages = async (req, res) => {
  const user_id = req.user.id;
  try {
    let user = await User.findOne({ _id: user_id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const messages = await Messages.find({
      $or: [
        { from: user_id },
        { to: user_id }
      ]
    }).populate('from to', '-__v -updatedAt -createdAt -protectedPrivateKey').populate({
      path: 'replyTo',
      populate: { path: 'from', select: 'fullname' }
    });

    res.status(200).json({
      message: "Messages fetched successfully",
      messages,
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new message
exports.createMessage = async (req, res) => {
  const { to, message, iv, senderEncryptedKey, recipientEncryptedKey, replyTo } = req.body;
  const from = req.user.id;
  if (!from) {
    return res.status(404).json({ message: 'User not found' });
  }
  try {
    let newMessage = await Messages.create({
      from, to, message,
      iv, senderEncryptedKey, recipientEncryptedKey,
      readorno: from === to ? true : false,
      updated: false,
      replyTo: replyTo || null
    });
    newMessage = await newMessage.populate('from to', '-__v');
    if (replyTo) {
      newMessage = await newMessage.populate({
        path: 'replyTo',
        populate: { path: 'from', select: 'fullname' }
      });
    }
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update message by ID
exports.updateMessageById = async (req, res) => {
  const { id } = req.params;
  const { message, iv, senderEncryptedKey, recipientEncryptedKey } = req.body;
  const user_id = req.user.id;
  const msg = await Messages.findOne({ _id: id });
  if (!msg) {
    return res.status(404).json({ message: 'Message not found' });
  }

  if (user_id.toString() !== msg.from.toString()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const itsmymsg = user_id.toString() === msg.from.toString();
  try {
    const updatedMessage = await Messages.findByIdAndUpdate(
      id,
      {
        message, iv, senderEncryptedKey, recipientEncryptedKey,
        updated: true, readorno: itsmymsg ? true : false
      },
      { new: true }
    ).populate('from to', '-__v');
    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.status(200).json(updatedMessage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete message by ID
exports.deleteMessageById = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  const msg = await Messages.findOne({ _id: id });
  if (!msg) {
    return res.status(404).json({ message: 'Message not found' });
  }
  if (user_id.toString() !== msg.from.toString()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const deletedMessage = await Messages.findByIdAndDelete({ _id: id });
    if (!deletedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateReadOrNoForMessages = async (req, res) => {
  const { from } = req.body;
  const user_id = req.user.id;

  try {
    const result = await Messages.updateMany(
      { from, to: user_id, readorno: false },
      { readorno: true },
      { new: true, runValidators: true }
    );
    res.status(200).json({ message: 'Messages updated successfully', result });
  } catch (error) {
    res.status(500).json({ message: 'Error marking messages as read', error });
  }
};
// Delete messages between two users if they exist
exports.deleteMessagesBetweenUsers = async (req, res) => {
  const user_id = req.user.id;
  const { from } = req.body;
  try {
    await Messages.deleteMany({
      $or: [
        { from: user_id, to: from },
        { from: from, to: user_id }
      ]
    });
    res.status(200).json({ success: true, message: 'deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
