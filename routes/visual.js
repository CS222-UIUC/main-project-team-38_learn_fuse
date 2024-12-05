const express = require('express');
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
  try {
    const data = await extractTextFromFile(fileContent, fileType);
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const groqApiResponse = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Provide how to construct the best mind map for the following text : ' + data,
        },
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.5,
      max_tokens: 1024,
    });
    const content = groqApiResponse.choices[0].message.content;
    response.json({ content: content });
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;




