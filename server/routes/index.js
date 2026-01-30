const express = require('express');
const router = express.Router();
const responseMiddleware = require('../middlewares/response');
const { requireAuth } = require('../middlewares/auth');

router.use(responseMiddleware);

const authRoutes = require('./auth');
router.use('/auth', authRoutes);

const resultRoutes = require('./result');
const userRoutes = require('./user');

router.use('/results', requireAuth, resultRoutes);
router.use('/users', requireAuth, userRoutes);

module.exports = router;
