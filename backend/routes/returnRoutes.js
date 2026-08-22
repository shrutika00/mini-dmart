const express = require('express');
const router = express.Router();
const {
  createReturnRequest,
  getReturnRequests,
  updateReturnRequestStatus
} = require('../controllers/returnController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(authorize('customer'), createReturnRequest)
  .get(getReturnRequests);

router.route('/:id/status')
  .put(authorize('staff', 'admin'), updateReturnRequestStatus);

module.exports = router;
