const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000; // Use the port from the environment variable or default to 5000

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello, World!'); // Response when the root URL is accessed
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // Log when the server starts
});
