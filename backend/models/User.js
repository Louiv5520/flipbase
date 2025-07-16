const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  nickname: { type: String },
  gender: { type: String },
  country: { type: String },
  profilePicture: { type: String },
  role: {
    type: String,
    default: 'Systemadministrator',
  },
  status: {
    type: String,
    default: 'Aktiv',
  },
  lastLoginDate: {
    type: Date,
  },
  lastLoginIp: {
    type: String,
  }
}, { timestamps: true }); // `timestamps: true` tilføjer `createdAt` og `updatedAt` automatisk

module.exports = mongoose.model('User', UserSchema); 