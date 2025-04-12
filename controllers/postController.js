const axios = require("axios");
const Post = require("../models/postModel");
const linkedinService = require("../services/linkedinService");


/**
 * @desc Create a new LinkedIn user post (text only for now)
 * @route POST /api/post
 * @access Private (assumes auth in place elsewhere)
 */

const createPost = async (req, res) => {
  try {
    // Extract content from request body
    const { content } = req.body;

    // Call LinkedIn service to create the post
    // The second argument (false) indicates it's a user post (not an organization post)
    const result = await linkedinService.createPost(content, false);

    // Respond with success message and LinkedIn post ID
    res.json({ success: true, message: result.message, linkedInId: result.linkedInId  });
  
  
  } catch (error) {
    // Log and handle any errors that occurred during post creation
    console.error("ERROR in createPost:", error);
    res.status(500).json({
      success: false,
      error: {
        type: 'SERVER_ERROR',
        message: error.message || 'Failed to create post'
      }
    });
  }
};

//Update contentPost on Linkedin
const updatePost = async (req, res) => {
  const { postId, newContent } = req.body;
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

  // Step 1: Remove "urn:li:share:" if included
  const idOnly = postId.replace("urn:li:share:", "");

  try {
    // Step 2: Delete existing post
    await axios.delete(`${process.env.LINKEDIN_API_URL}/shares/${idOnly}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    // Step 3: Create new post with newContent
    const result = await linkedinService.createPost(newContent, false); // false = user post

    res.json({
      success: true,
      message: "Post updated (old one deleted, new one created)",
      linkedInId: result.linkedInId
    });
  } catch (error) {
    console.error("Update Post Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: {
        type: "SERVER_ERROR",
        message: "Failed to update the LinkedIn post"
      }
    });
  }
};




/**
 * @desc Delete a LinkedIn post by its ID
 * @route DELETE /api/post/:postId
 * @access Private
 */

const deletePost = async (req, res) => {
  // Log the request parameters for debugging
  console.log("DELETE Request Params:", req.params);

  const { postId } = req.params;

  // If postId is not provided, return a 400 Bad Request
  if (!postId) {
    return res.status(400).json({
      success: false,
      error: {
        type: "BAD_REQUEST",
        message: "Post ID is required",
      },
    });
  }

  // Construct the LinkedIn URN (Uniform Resource Name) for the post
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const urn = `urn:li:share:${postId}`;

  try {
    // Send a DELETE request to LinkedIn's API to remove the post
    await axios.delete(`${process.env.LINKEDIN_API_URL}/shares/${urn}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });


    // Remove the post record from the local MongoDB database
    await Post.findOneAndDelete({ linkedinId: urn });

    // Respond with success
    res.json({
      success: true,
      message: "Post deleted successfully from LinkedIn",
      linkedInId: urn,
    });
  } catch (error) {
    
    console.error("LinkedIn Delete Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};


module.exports = {
  createPost,
  updatePost,  
  deletePost,
};
