const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

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

app.listen(3000, function () {
  console.log('Server started on port 3000');
});
