const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('Real Estate Listing Intelligence API is live!');
});

app.get('/analyze-url', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing ?url=' });

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const imageUrls = [];
    $('img').each((i, el) => {
      const src = $(el).attr('src');
      if (src && src.startsWith('http') && !imageUrls.includes(src)) {
        imageUrls.push(src);
      }
    });

    const description = $('meta[name="description"]').attr('content') || $('title').text();

    res.json({
      source: url,
      description,
      imageUrls: imageUrls.slice(0, 5),
      message: 'Data scraped. Ready for AI tagging.'
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch or parse the URL', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
