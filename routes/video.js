const express = require('express');
const router = express.Router();
const axios = require('axios');
const Groq = require('groq-sdk');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

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

// async function getSearchQueryFromNoteTaker(text, type) {

// }

async function searchInternetArchive(searchQuery) {
    try {
        const response = await axios.get('https://archive.org/advancedsearch.php', {
            params: {
                q: searchQuery + ` AND mediatype:movies`,
                output: 'json',
                rows: 5,
                page: 1,
                fl: ['title', 'description', 'identifier']
            }
        });

        return response.data.response.docs
            .filter(doc => doc.description)
            .map(doc => ({
                title: doc.title,
                url: `https://archive.org/details/${doc.identifier}`,
                source: 'Internet Archive',
                description: doc.description.slice(0, 150) + '...'
            }));
    } catch (error) {
        console.error('Internet Archive API error:', error);
        return [];
    }
}

async function searchVimeo(searchQuery) {
    if (!process.env.VIMEO_ACCESS_TOKEN) return [];
    
    try {
        const response = await axios.get('https://api.vimeo.com/videos', {
            headers: {
                'Authorization': `Bearer ${process.env.VIMEO_ACCESS_TOKEN}`
            },
            params: {
                query: searchQuery,
                per_page: 5,
                filter: 'CC',
                sort: 'relevant',
                fields: 'name,description,link,duration'
            }
        });
        
        return response.data.data
            .filter(video => video.duration < 1800)
            .map(video => ({
                title: video.name,
                url: video.link,
                source: 'Vimeo',
                description: video.description?.slice(0, 150) + '...' || 'No description available'
            }));
    } catch (error) {
        console.error('Vimeo API error:', error);
        return [];
    }
}

router.post('/', async function (req, res) {
    try {
        const removeQuotes = (str) => str.replace(/^['"]|['"]$/g, '');
        const { fileContent, fileType } = req.body;
        if (!fileContent) {
            return res.status(400).json({ error: 'Text content is required' });
        }
        
        
        var searchQuery = '';
    
        // searchQuery, err = await getSearchQueryFromNoteTaker(fileContent, fileType);
        const prompt = `You are a learning resource finder for videos on Internet Archive and Vimeo. Given the text, create a search query to find educational videos.
        Rules:
        1. Output ONLY one search query, nothing else
        2. Keep it under 200 characters, preferably only 4-5 words
        3. Add "tutorial" or "learn" if it's a skill/concept
        4. If the text discusses multiple topics, focus on the most important one
        5. Make it general enough to get results
        
        Example outputs:
        "linear algebra matrices mathematics tutorial"
        "photosynthesis biology learn"
        "world war 2 pacific theater history"
        "python loops programming tutorial"
        
        CONTENT: `;
        const data = await extractTextFromFile(fileContent, fileType);
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const groqApiResponse = await groq.chat.completions.create({
        messages: [
        {
            role: 'user',
            content: prompt + data,
        },
        ],
        model: 'mixtral-8x7b-32768',
        temperature: 0.5,
        max_tokens: 128,
        });
        searchQuery = groqApiResponse.choices[0].message.content;

        searchQuery = removeQuotes(searchQuery);

        var archiveResults = [];
        var vimeoResults = [];
        for (let i = 0; i < 5; i++) {
            console.log("query: ", searchQuery);
            if (archiveResults.length == 0) {
                archiveResults = await searchInternetArchive(searchQuery);
            }
            if (vimeoResults.length == 0) {
                vimeoResults = await searchVimeo(searchQuery);
            }

            var allResults = [...archiveResults, ...vimeoResults];
            if (archiveResults.length > 0 && vimeoResults > 0) {
                break;
            }
            const words = searchQuery.split(' ');
            words.pop();
            if (words.length == 0) {
                break;
            }
            searchQuery = words.join(' ');
        }

        res.json({ 
            recommendations: allResults,
            searchQuery // Include for debugging/transparency
        });
    } catch (error) {
        console.error('Error getting recommendations:', error);
        if (error.status == 413) {
            return res.status(413).json({
                error: 'File is too large to be processed',
                details: error.message,
              });
        }
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
});

module.exports = router;