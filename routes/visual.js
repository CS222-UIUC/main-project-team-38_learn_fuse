const express = require('express');
const Groq = require('groq-sdk');
const router = express.Router();
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function extractTextFromFile(fileContent, fileType) {
  console.log("here");
  try {
    const buffer = Buffer.from(fileContent, 'base64');

    if (fileType === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      return preprocessText(pdfData.text);
    } else if (
      fileType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return preprocessText(result.value);
    } else if (fileType === 'text/plain') {
      return preprocessText(buffer.toString('utf-8'));
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    throw error;
  }
}

function preprocessText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\r\n]+/g, '\n')
    .trim();
}

function generateMindMapPrompt(text) {
  return `Please create a comprehensive mind map for the following content. Focus on:
1. Main topics and key concepts
2. Hierarchical relationships between ideas
3. Important connections and dependencies
4. Core themes and supporting details

Text content: ${text}

Please structure the mind map with clear central topics, main branches for themes, and sub-branches for details.`;
}

router.post('/', async function (request, response) {
  const { fileContent, fileType } = request.body;

  if (!fileContent || !fileType) {
    return response.status(400).json({ 
      error: 'Missing required fields: fileContent and fileType' 
    });
  }

  try {
    const extractedText = await extractTextFromFile(fileContent, fileType);
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const groqApiResponse = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: generateMindMapPrompt(extractedText)
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.5,
      max_tokens: 1024
    });

    response.json({ 
      content: groqApiResponse.choices[0].message.content,
      textLength: extractedText.length
    });

  } catch (error) {
    console.error('Processing error:', error);
    response.status(500).json({ 
      error: error.message
    });
  }
});

module.exports = router;




