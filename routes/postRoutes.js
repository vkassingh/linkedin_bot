const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { uploadMediaPost} = require('../controllers/uploadController');




// Create a post
router.post('/', postController.createPost);

//Update contentPost on Linkedin
router.put("/", postController.updatePost);

// Delete a post
router.delete('/:postId', postController.deletePost);


module.exports = router;
