const express = require('express');
const router = express.Router();
const {
  getCommunities,
  getCommunityById,
  createCommunity,
  joinCommunity,
  leaveCommunity,
} = require('../controllers/communityController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getCommunities)
  .post(protect, createCommunity);

router.route('/:id')
  .get(protect, getCommunityById);

router.post('/:id/join', protect, joinCommunity);
router.post('/:id/leave', protect, leaveCommunity);

module.exports = router;
