const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().required().trim(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'doctor', 'lab_technician').default('lab_technician')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.fail(error.details[0].message, 400);
    }

    const existingUser = await User.findOne({ email: value.email });
    if (existingUser) {
      return res.fail('Email already registered', 400);
    }

    const user = await User.create(value);
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.success({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }, 'Registration successful', 201);
  } catch (err) {
    res.fail(err.message, 500);
  }
};

const login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.fail(error.details[0].message, 400);
    }

    const user = await User.findOne({ email: value.email });
    if (!user) {
      return res.fail('Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(value.password, user.password);
    if (!isMatch) {
      return res.fail('Invalid credentials', 401);
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.success({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }, 'Login successful');
  } catch (err) {
    res.fail(err.message, 500);
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.success(null, 'Logout successful');
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.success({ user }, 'Profile retrieved');
  } catch (err) {
    res.fail(err.message, 500);
  }
};

module.exports = { register, login, logout, getProfile };
