const express = require('express');
const router = express.Router();
const { getPosts, createPost, getPostById, updatePost, deletePost } = require('../controllers/postController');
const { protect, optionalProtect } = require('../middleware/auth');

router.route('/')
  .get(optionalProtect, getPosts)
  .post(protect, createPost);

router.route('/:id')
  .get(optionalProtect, getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

module.exports = router;
