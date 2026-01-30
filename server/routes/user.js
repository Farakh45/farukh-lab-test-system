const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middlewares/auth');

router.get('/', requireAuth, requireRole('admin'), getUsers);

module.exports = router;
