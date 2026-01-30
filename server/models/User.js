const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { TitleCase, lowerTrim } = require('../utils/strings');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'lab_technician'],
    default: 'lab_technician'
  }
}, {
  timestamps: true
});

userSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.name = TitleCase(this.name);
  }
  if (this.isModified('email')) {
    this.email = lowerTrim(this.email);
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
