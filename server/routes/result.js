const express = require('express');
const router = express.Router();
const { create, list, getOne, updateStatus } = require('../controllers/resultController');
const { requireAuth, requireRole } = require('../middlewares/auth');

router.post('/', requireAuth, requireRole('lab_technician'), create);
router.get('/', requireAuth, list);
router.get('/:id', requireAuth, getOne);
router.patch('/:id/status', requireAuth, updateStatus);

module.exports = router;
