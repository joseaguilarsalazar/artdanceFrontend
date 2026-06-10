const express = require('express');
const path = require('path');
const app = express();

// Use the port provided by Docker, or default to 3000 for local testing
const PORT = process.env.PORT || 3000;

// Serve all static assets from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Fallback routing to ensure index.html handles requests smoothly
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server is running securely on port ${PORT}`);
});