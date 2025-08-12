const BACKEND_URL = "http://localhost:3000";

let puzzles = [
  [1, 2, 3, 4, 5],
  [3, 4, 5, 1, 2],
  [6, 10, 12, 2],
  [5, 4, 3, 2, 1],
  [7, 9, 11, 13, 3],
  [2, 2, 2, 2],
  [12, 16, 0, 3, 6, 10],
  [3, 4, 5, 6]
];

let currentArray = [];
let defaultCode = document.getElementById("code-editor").value;
let isSorted = null;
let isRotatedAscending = null;
let currentScore = 0;
let scoreDisplay;

function loadFunctionsFromEditor() {
  try {
    let code = document.getElementById("code-editor").value;
    let funcWrapper = new Function(code + "; return { isSorted, isRotatedAscending };");
    let funcs = funcWrapper();
    isSorted = funcs.isSorted;
    isRotatedAscending = funcs.isRotatedAscending;
    document.getElementById("code-error").textContent = "";
    return true;
  } catch (e) {
    document.getElementById("code-error").textContent = "❌ Error in your code: " + e.message;
    return false;
  }
}

function evaluateArray(arr) {
  if (isSorted(arr)) return "sorted";
  else if (isRotatedAscending(arr)) return "rotated";
  else return "none";
}

function submitAnswer(choice) {
  if (!loadFunctionsFromEditor()) return;
  let correct = evaluateArray(currentArray);
  let feedback = document.getElementById("feedback");

  if (choice === correct) {
    handleCorrectAnswer();
    feedback.textContent = "✅ Correct! Well done.";
    feedback.style.color = "green";
  } else {
    feedback.textContent = `❌ Wrong! The correct answer is: ${correct.toUpperCase()}`;
    feedback.style.color = "red";
  }

  if (currentScore >= 5) {
    let name = prompt("🎉 You've scored 5 points! Enter your name to save your score:");
    if (name && name.trim()) {
      console.log('Submitting score:', { name: name.trim(), correctAnswers: currentScore });

      fetch(`${BACKEND_URL}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: name.trim(), 
          correctAnswers: currentScore, 
          contributions: 0 })
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          console.log('Score submission response:', data);
          alert("🏆 Score submitted successfully!");
          currentScore = 0;
          updateScoreDisplay();
          setTimeout(() => {
            console.log('Refreshing leaderboard...');
            fetchLeaderboard();
          }, 500);
        })
        .catch(err => {
          console.error('Score submission error:', err);
          alert("⚠️ Failed to submit score. Try again.");
        });
    }
  }
}

function nextPuzzle() {
  currentArray = puzzles[Math.floor(Math.random() * puzzles.length)];
  document.getElementById("array-display").textContent = `[${currentArray.join(", ")}]`;
  document.getElementById("feedback").textContent = "";
}

function applyCustomLogic() {
  if (loadFunctionsFromEditor()) {
    alert("✅ Custom logic applied successfully!");
  }
}

function resetCode() {
  document.getElementById("code-editor").value = defaultCode;
  loadFunctionsFromEditor();
}

function handleCorrectAnswer() {
  currentScore += 1;
  updateScoreDisplay();
}

function updateScoreDisplay() {
  const scoreElement = document.getElementById('current-score');
  if (scoreElement) {
    scoreElement.textContent = currentScore;
  } else {
    console.warn('Score display element not found');
  }
}

async function fetchLeaderboard() {
  try {
    const res = await fetch(`${BACKEND_URL}/leaderboard`);

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const users = await res.json();
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';

    if (users.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No scores yet - be the first!';
      li.style.fontStyle = 'italic';
      li.style.color = '#666';
      list.appendChild(li);
    } else {
      users.forEach((user, index) => {
        const li = document.createElement('li');
        li.textContent = `${user.name} - ${user.points} pts`; // correct field name

        if (index === 0) li.style.fontWeight = 'bold';
        list.appendChild(li);
      });
    }
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    const li = document.createElement('li');
    li.textContent = 'Unable to load leaderboard (server offline?)';
    li.style.fontStyle = 'italic';
    li.style.color = '#ff6b6b';
    list.appendChild(li);
  }
}

window.onload = () => {
  scoreDisplay = document.getElementById('current-score');
  resetCode();
  nextPuzzle();
  updateScoreDisplay();
  fetchLeaderboard();
};
