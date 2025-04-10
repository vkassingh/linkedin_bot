const axios = require('axios');
const uploadService = require('../services/uploadService');

// POST /api/upload/media
exports.uploadMedia = async (req, res) => {
  try {
    const { imgURL, videoURL, type, text } = req.body;
    const result = await uploadService.handleMediaPost({ imgURL, videoURL, type, text });
    res.status(200).json({ success: true, message: 'Posted successfully!', data: result });
  } catch (error) {
    console.error("Error in uploadMedia:", error);
    res.status(500).json({ success: false, error: error.message || "Something went wrong" });
  }
};
