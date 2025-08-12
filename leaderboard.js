const BACKEND_URL = "http://localhost:3000";

async function submitScore() {
  const name = document.getElementById('name').value;
  const correctAnswers = parseInt(document.getElementById('correct').value) || 0;
  const newContributions = parseInt(document.getElementById('contrib').value) || 0;

  await fetch(`${BACKEND_URL}/submit`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, correctAnswers, contributions: newContributions })
  });

  loadLeaderboard();
}


async function loadLeaderboard() {
  const res = await fetch(`${BACKEND_URL}/leaderboard`);
  const users = await res.json();

  const ul = document.getElementById('leaderboard');
  ul.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = `${user.name} - ${user.points} pts (${user.contributions} contributions)`;

    ul.appendChild(li);
  });
}

loadLeaderboard(); // load leaderboard on page load
