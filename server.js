require('dotenv').config(); // Load variables from .env file
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// 🌟 NEW: Dynamic endpoint that feeds environment variables straight to the browser
app.get('/env.js', (req, res) => {
  res.type('application/javascript');
  res.send(`
    window.ENV = {
      API_URL: "${process.env.API_URL || 'http://localhost:8000/'}"
    };
  `);
});

// Serve static assets from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});