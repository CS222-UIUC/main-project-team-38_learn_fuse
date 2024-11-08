const express = require('express');
const router = express.Router();

const fs = require('fs');
const tts = require('google-tts-api');
const axios = require('axios');

let outputFile = 'audioFile.mp3';

router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    console.log(res);

    const language = 'en';
    const url = await tts.getAudioUrl(text, {
      lang: language,
      slow: false,
      host: 'https://translate.google.com',
    });

    const response = await axios.get(url, { responseType: 'arraybuffer' });

    fs.writeFileSync(outputFile, Buffer.from(response.data));
  } catch (error) {
    console.error('Encountered an error!', error);
  }
});

router.get('/download', (req, res) => {
  if (!fs.existsSync(outputFile)) {
    return res.status(404).send('File not found');
  }

  res.download(outputFile, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).send('Error downloading file');
    }
  });
});

module.exports = router;
