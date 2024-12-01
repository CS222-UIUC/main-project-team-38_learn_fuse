const express = require('express');
const router = express.Router();
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const tts = require('google-tts-api');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');

const finalOutputFile = 'final-audioFile.mp3';

async function extractTextFromFile(fileContent, fileType) {
  try {
    const buffer = Buffer.from(fileContent, 'base64');
    if (fileType == 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      return pdfData.text;
    } else if (fileType == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
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

function splitTextIntoChunks(text, chunkSize = 200) {
  const chunks = [];
  let currentChunk = '';

  const words = text.split(/\s+/);

  for (const word of words) {
    if (word.length > chunkSize) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      for (let i = 0; i < word.length; i += chunkSize) {
        chunks.push(word.slice(i, i + chunkSize));
      }
      continue;
    }

    if ((currentChunk + ' ' + word).trim().length > chunkSize) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = word;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + word;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

router.post('/', async (req, res) => {
  try {
    var { text, type } = req.body;
    
    text = await extractTextFromFile(text, type);
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // const chunkSize = 200;
    // const chunks = [];
    // for (let i = 0; i < text.length; i += chunkSize) {
    //   chunks.push(text.slice(i, i + chunkSize));
    // }
    const chunks = splitTextIntoChunks(text, 200);

    const audioUrls = [];
    for (const chunk of chunks) {
      const url = await tts.getAudioUrl(chunk, {
        lang: 'en',
        slow: false,
        host: 'https://translate.google.com',
      });
      audioUrls.push(url);
    }

    const outputFiles = [];
    for (let i = 0; i < audioUrls.length; i++) {
      const response = await axios.get(audioUrls[i], { responseType: 'arraybuffer' });
      const outputFile = `audioFile-${i}.mp3`;
      fs.writeFileSync(outputFile, Buffer.from(response.data));
      outputFiles.push(outputFile);
    }

    // merge files
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input('concat:' + outputFiles.join('|'))
        .outputOptions('-c copy')
        .output(finalOutputFile)
        .on('end', () => {
          // clean up temp files
          outputFiles.forEach(file => fs.unlinkSync(file));
          resolve();
        })
        .on('error', (err) => {
          console.error('Error merging files:', err);
          reject(err);
        })
        .run();
    });

    res.status(200).json({ 
      message: 'Audio file created successfully!', 
      outputFile: finalOutputFile 
    });

  } catch (error) {
    console.error('Encountered an error!', error);
    res.status(500).json({ error: 'Failed to convert text to speech' });
  }
});

router.get('/download', (req, res) => {
  if (!fs.existsSync(finalOutputFile)) {
    return res.status(404).send('File not found');
  }
  
  res.download(finalOutputFile, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).send('Error downloading file');
    }
    // else {
    //   // delete after download?
    //   fs.unlink(outputFile, (unlinkErr) => {
    //     if (unlinkErr) console.error('Error deleting file:', unlinkErr);
    //   });
    // }
  });
});

module.exports = router;