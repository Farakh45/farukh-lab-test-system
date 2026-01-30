const User = require('../models/User');

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.success({ users }, 'Users retrieved');
  } catch (err) {
    res.fail(err.message, 500);
  }
};

module.exports = { getUsers };
