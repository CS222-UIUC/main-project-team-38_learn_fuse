const express = require('express');
const router = express.Router();
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const fs = require('fs');
const tts = require('google-tts-api');
const axios = require('axios');

let outputFile = 'audioFile.mp3';

async function extractTextFromFile(fileContent, fileType) {
  try {
    const buffer = Buffer.from(fileContent, 'base64');

    if (fileType == 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      return pdfData.text;
    } else if (
      fileType ==
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (fileType == 'text/plain') {
      return buffer.toString('utf-8');
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    throw error;
  }
}

router.post('/', async (req, res) => {
  try {
    var { text, type } = req.body;
    text = await extractTextFromFile(text, type);
    // only allows 200 characters max
    text = text.substring(0, 200);
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // console.log(res);

    const language = 'en';
    const url = await tts.getAudioUrl(text, {
      lang: language,
      slow: false,
      host: 'https://translate.google.com',
    });

    const response = await axios.get(url, { responseType: 'arraybuffer' });

    // outputFile = `audioFile-${Date.now()}.mp3`;
    // await fs.promises.writeFile(outputFile, Buffer.from(response.data));

    // res.status(200).json({ message: 'File created successfully!', outputFile });

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

// router.get('/download', (req, res) => {
//   const { file } = req.query; // Use query to specify the file name
//   if (!file || !fs.existsSync(file)) {
//     return res.status(404).send('File not found');
//   }

//   res.download(file, (err) => {
//     if (err) {
//       console.error('Error downloading file:', err);
//       res.status(500).send('Error downloading file');
//     } else {
//       fs.unlink(file, (err) => {
//         if (err) console.error('Error deleting file:', err);
//       });
//     }
//   });
// });

module.exports = router;
