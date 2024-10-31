const express = require('express');
const { default: Groq } = require('groq-sdk');
const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

router.post('/', async (req, res) => {
  const { fileContent } = req.body;

  const recommendationPrompt = `Please provide activity recommendations for a kinesthetic learner to better absorb the following material:\n${fileContent}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: recommendationPrompt,
        },
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 1024,
    });

    if (!completion.choices || completion.choices.length === 0) {
      return res
        .status(500)
        .json({ error: 'No choices found in the response' });
    }

    // const response = completion.choices[0].message.content;
    return res.json(completion);
    // console.log(response);
    // return res.status(200).json();
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({
      error: 'An error occurred while processing your request',
      details: error.message,
    });
  }
});

router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Unhandled error',
    details: err.message,
  });
  next(err);
});

module.exports = router;
