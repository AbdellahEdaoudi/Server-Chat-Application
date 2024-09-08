const Messages = require('../models/Messages');

// Get all messages
exports.getMessages = async (req, res) => {
  try {
    const messages = await Messages.find();
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get message by ID
exports.getMessageById = async (req, res) => {
  const { id } = req.params;
  try {
    const message = await Messages.findById({_id:id});
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new message
exports.createMessage = async (req, res) => {
  const messageData = req.body;
  try {
    const newMessage = await Messages.create(messageData);
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update message by ID
exports.updateMessageById = async (req, res) => {
  const { id } = req.params;
  const messageData = req.body;
  try {
    const updatedMessage = await Messages.findByIdAndUpdate({_id:id}, messageData, { new: true });
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
  try {
    const deletedMessage = await Messages.findByIdAndDelete({_id:id});
    if (!deletedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
  
// Delete all messages
exports.deleteAllMessages = async (req, res) => {
  try {
    const msg = await Messages.deleteMany();
    res.status(200).json({ message: ` ${msg.deletedCount} : All messages deleted successfully`});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateReadOrNoForMessages = async (req, res) => {
  const { fromEmail, toEmail } = req.body;

  try {
    const result = await Messages.updateMany(
      { from: fromEmail, to: toEmail ,readorno:false},
      { readorno: true },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: 'Messages updated successfully', result });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
// Delete messages between two users if they exist
exports.deleteMessagesBetweenUsers = async (req, res) => {
  try {
    const { Emailuser, FriendReq } = req.body;
    const messagesExist = await Messages.findOne({
      $or: [
        { from: Emailuser, to: FriendReq },
        { from: FriendReq, to: Emailuser }
      ]
    });
    if (!messagesExist) {
      return res.status(404).json({ success: false, message: 'No messages found between these users' });
    }
    const deleteMessages = await Messages.deleteMany({
      $or: [
        { from: Emailuser, to: FriendReq },
        { from: FriendReq, to: Emailuser }
      ]
    });
    res.status(200).json({ success: true, message: 'Messages between users deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
