const { scrapeAndPostData } = require("../services/scraperService");
const facebookConfig = require("../config/facebook");

async function scrapeAndPost(req, res) {
  const { email, password, groupId, postContent } = req.body;
  const images = req.files ? req.files.map(file => file.path) : [];

  try {
    await scrapeAndPostData(
      facebookConfig,
      { email, password, groupId, postContent, images }
    );
    res.status(200).json({ message: "Post published successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { scrapeAndPost };
