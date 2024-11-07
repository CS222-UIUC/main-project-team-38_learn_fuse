const express = require('express');
const { default: Groq } = require('groq-sdk');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

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
  const { fileContent, fileType } = req.body;

  try {
    const extractedText = await extractTextFromFile(fileContent, fileType);
    const recommendationPrompt = `As an expert in kinesthetic learning, analyze the following educational content and provide 3-5 specific hands-on activities. For each activity:
    - Describe the activity in 2-3 clear steps
    - Explain how it connects to the material
    - Mention any simple materials needed
    - Include an estimated time duration
    
    Content to analyze:
    ${extractedText}
    
    Format each activity as:
    GROQ-API-SUGG Activity X: [Name]
    - Steps: [numbered steps]
    - Connection: [brief explanation]
    - Materials: [simple list]
    - Time: [duration]`;
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: recommendationPrompt,
        },
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.5,
      max_tokens: 1024,
    });

    if (!completion.choices || completion.choices.length === 0) {
      return res.status(500).json({ error: 'No recommendations generated' });
    }

    return res.json(completion);
  } catch (error) {
    return res.status(error.status).json({
      error: 'An error occurred while processing your request',
      details: error.message,
    });
  }
});

module.exports = router;
