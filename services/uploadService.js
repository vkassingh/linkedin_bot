const axios = require('axios');
require('dotenv').config();

const LINKEDIN_API_URL = process.env.LINKEDIN_API_URL;
const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const LINKEDIN_COMPANY_ID = process.env.LINKEDIN_COMPANY_ID;

// Register LinkedIn upload and return asset URN and upload URL
async function registerUpload(type) {
  const recipe = type === 'image'
    ? 'urn:li:digitalmediaRecipe:feedshare-image'
    : 'urn:li:digitalmediaRecipe:feedshare-video';

  const body = {
    registerUploadRequest: {
      owner: `urn:li:organization:${LINKEDIN_COMPANY_ID}`,
      recipes: [recipe],
      serviceRelationships: [
        {
          relationshipType: 'OWNER',
          identifier: 'urn:li:userGeneratedContent'
        }
      ]
    }
  };

  const res = await axios.post(
    `${LINKEDIN_API_URL}/assets?action=registerUpload`,
    body,
    {
      headers: {
        Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return res.data.value;
}

// Upload binary file to LinkedIn upload URL
async function uploadMedia(uploadUrl, mediaBuffer, contentType) {
  await axios.put(uploadUrl, mediaBuffer, {
    headers: {
      Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
      'Content-Type': contentType
    }
  });
}

// Create LinkedIn post using media asset
async function createPost(type, text, assetUrn) {
  const owner = `urn:li:organization:${LINKEDIN_COMPANY_ID}`;

  const postBody = {
    author: owner,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: type.toUpperCase(), // 'IMAGE' or 'VIDEO'
        // ✅ NEW (fixed)
media: [{
  status: 'READY',
  media: assetUrn,  // ← this is the URN you got from registerUpload()
  title: { text: 'Some Title' },
  description: { text }
}]

      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  };

  const response = await axios.post(
    `${LINKEDIN_API_URL}/ugcPosts`,
    postBody,
    {
      headers: {
        Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

// Wrapper that does full media posting flow
async function handleMediaPost({ imgURL, videoURL, type, text }) {
  const mediaURL = type === 'image' ? imgURL : videoURL;
  const contentType = type === 'image' ? 'image/jpeg' : 'video/mp4';

  const mediaResponse = await axios.get(mediaURL, { responseType: 'arraybuffer' });

  const { uploadMechanism, asset } = await registerUpload(type);
  const uploadUrl = uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;

  await uploadMedia(uploadUrl, mediaResponse.data, contentType);

  const postResult = await createPost(type, text, asset);

  return postResult;
}

module.exports = {
  handleMediaPost
};

