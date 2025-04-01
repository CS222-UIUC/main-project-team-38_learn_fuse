const express = require('express');
// const multer = require('multer');
// const fs = require('fs');
// const upload = multer({ dest: 'uploads/' });
const Groq = require('groq-sdk');
const router = express.Router();
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function extractTextFromFile(fileContent, fileType) {
  console.log("here");
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

router.post('/', async function (request, response) {
  const { fileContent, fileType } = request.body;
  // if (!request.file) {
  //     return response.status(400).json({ error: 'No file uploaded' });
  // }

  // fs.readFile(request.file.path, 'utf-8', async (err, data) => {
  //     if (err) {
  //     console.error('Error reading file:', err);
  //     return response.status(500).json({ error: 'Error reading file' });
  //     }

  //     fs.unlink(request.file.path, (unlinkErr) => {
  //     if (unlinkErr) {
  //         console.error('Error deleting temporary file:', unlinkErr);
  //     }
  //     });

  // });

  try {
    const data = await extractTextFromFile(fileContent, fileType);
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const groqApiResponse = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Provide key points for the following : ' + data,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 1024,
    });
    const content = groqApiResponse.choices[0].message.content;
    response.json({ content: content });
  } catch (error) {
    console.error(error);
    return response.status(error.status).json({
      error: 'An error occurred while processing your request',
      details: error.message,
    });
  }
});

module.exports = router;
