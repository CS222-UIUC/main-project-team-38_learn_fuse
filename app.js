const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const multer = require('multer');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static(__dirname + '/views'));

app.use('/public', express.static(__dirname + '/public'));

const contactRoutes = require('./routes/contact');
app.use('/api/contact', contactRoutes);

const kinestheticRoutes = require('./routes/kinesthetic');
app.use('/api/kinesthetic', kinestheticRoutes);

app.get('/', function (request, response) {
  // response.send("testing");
  response.sendFile(__dirname + '/views/index.html');
});

//changes
app.get('/scribble', function (request, response) {
  response.sendFile(__dirname + '/views/scribble.html');
});

app.post('/upload', upload.single('file'), function (request, response) {
  if (!request.file) {
    return response.status(400).json({ error: 'No file uploaded' });
  }

  fs.readFile(request.file.path, 'utf-8',(err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return response.status(500).json({ error: 'Error reading file' });
    }

    fs.unlink(request.file.path, (unlinkErr) => {
      if (unlinkErr) {
        console.error('Error deleting temporary file:', unlinkErr);
      }
    });

    response.json({ content: data });
  });
});

app.listen(3000, function () {
  console.log('Server started on port 3000');
});
