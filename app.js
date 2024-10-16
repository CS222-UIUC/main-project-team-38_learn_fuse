const express = require('express');
const app = express();

app.use(express.static('public'));

app.use('/public', express.static(__dirname + '/public'));

app.get('/', function (request, response) {
  // response.send("testing");
  response.sendFile(__dirname + '/views/index.html');
});

app.listen(3000, function () {
  console.log('Server started on port 3000');
});
