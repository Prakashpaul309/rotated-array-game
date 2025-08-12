const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint (must be before static files)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// API Routes
// Leaderboard array is already declared above

// POST: Submit or update a user's score
app.post('/submit', (req, res) => {
  const { name, correctAnswers, contributions } = req.body;
  
  if (!name || correctAnswers === undefined || contributions === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existing = leaderboard.find(user => user.name.toLowerCase() === name.trim().toLowerCase());

  if (existing) {
    existing.points += correctAnswers + 2 * contributions;
    existing.contributions += contributions;
  } else {
    leaderboard.push({
      name: name.trim(),
      points: correctAnswers + 2 * contributions,
      contributions
    });
  }

  // Sort by points in descending order
  leaderboard.sort((a, b) => b.points - a.points);
  
  res.json({ success: true, leaderboard });
});

// GET: Get leaderboard
app.get('/leaderboard', (req, res) => {
  res.json(leaderboard);
});

// All other GET requests not handled before will return the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

let leaderboard = [];

// POST: Submit or update a user's score
app.post('/submit', (req, res) => {
  const { name, correctAnswers, contributions } = req.body;

  const existing = leaderboard.find(user => user.name.toLowerCase() === name.trim().toLowerCase());

  if (existing) {
    // Update existing user's score
    existing.points += correctAnswers + 2 * contributions;
    existing.contributions += contributions;
  } else {
    // Add new user
    leaderboard.push({
      name: name.trim(),
      points: correctAnswers + 2 * contributions,
      contributions: contributions
    });
  }

  // Sort by points descending
  leaderboard.sort((a, b) => b.points - a.points);

  res.status(200).json({ success: true });
});

// GET: Leaderboard
app.get('/leaderboard', (req, res) => {
  res.json(leaderboard.slice(0, 5)); // Only top 5
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
