const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.post('/', async (req, res) => {
  const { fileContent } = req.body;

  const recommendationPrompt = `Please provide activity recommendations and youtube links for a kinesthetic learner:/n${fileContent}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: recommendationPrompt }],
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      console.log('Network response was not ok!');
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      return res
        .status(500)
        .json({ error: 'No choices found in the response' });
    }

    if (!data.choices[0].message || !data.choices[0].message.content) {
      return res.status(500).json({ error: 'No message content found' });
    }

    res.json(data.choices[0].message.content);
  } catch (error) {
    console.log('Error occurred', error);
    res
      .status(500)
      .json({ error: 'An error occurred while processing your request' });
  }
});

module.exports = router;
