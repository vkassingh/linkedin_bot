const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { uploadMediaPost} = require('../controllers/uploadController');


// Create a post
router.post('/', postController.createPost);

// Delete a post
router.delete('/:postId', postController.deletePost);

// Get all posts
router.get('/', postController.getAllPosts);

// Get a single post by ID
router.get('/:id', postController.getPostById);

module.exports = router;
