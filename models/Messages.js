const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    trim: true
  },
  iv: {
    type: String,
    trim: true
  },
  senderEncryptedKey: {
    type: String,
    trim: true
  },
  recipientEncryptedKey: {
    type: String,
    trim: true
  },
  updated: {
    type: Boolean,
    default: false
  },
  readorno: {
    type: Boolean,
    default: false
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
}, { timestamps: true });

module.exports = mongoose.models.Message || mongoose.model('Message', MessageSchema);
