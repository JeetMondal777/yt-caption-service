const express = require("express");
const youtubeCaptions = require("youtube-captions-scraper");
const cors = require("cors");

const app = express();
app.use(cors({
    origin:process.env.CLIENT_URL,
}));

// Middleware to parse JSON request bodies
app.use(express.json()); // This will parse the incoming JSON data

// Function to extract video ID from YouTube URL
const extractVideoId = (url) => {
  const regex = /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S+?[\?&]v=)([a-zA-Z0-9_-]{11}))|(?:https?:\/\/(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11}))/;
  const match = url.match(regex);
  return match ? match[1] || match[2] : null;
};

// Route to get captions using YouTube video URL
app.post('/captions', async (req, res) => {
  const { videoUrl } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing YouTube URL' });
  }

  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    // Fetch captions for the given video ID
    const captions = await youtubeCaptions.getSubtitles({
      videoID: videoId,
      lang: 'en'  // You can specify other languages as well
    });

    // Check if captions exist
    if (!captions || captions.length === 0) {
      return res.status(404).json({ error: 'No captions found for this video' });
    }

    // Send back the captions
    res.json(captions);
  } catch (err) {
    console.error("Error fetching captions:", err);
    res.status(500).json({ error: 'Failed to fetch captions', details: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Microservice running on port ${PORT}`));
