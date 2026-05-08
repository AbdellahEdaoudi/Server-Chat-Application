const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullname: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  username: { type: String, trim: true, unique: true },
  profileImage: { type: String, trim: true },
  password: { type: String, required: true },
  isOnline: { type: Boolean, default: false },
  publicKey: { type: String, trim: true },
  protectedPrivateKey: { type: String, trim: true },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
