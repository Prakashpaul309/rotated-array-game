const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, '..')));

// Route for the root URL
app.get('/', (req, res) => {
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
