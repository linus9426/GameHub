import { categories, icons } from './data.js';
import { questions } from './questions.js';
import { startTimer, stopTimer } from './timer.js';
import { resetScore, increaseScore, addToTotal, fetchLeaderboard } from './score.js';


const gameContainer = document.getElementById('game-container');

let spinning = false;
let currentRotation = 0;
const segmentCount = categories.length;
const segmentAngle = 360 / segmentCount;

let categoriesPlayed = 0;
const totalCategories = 5;
let accumulativeScore = 0;
let roundPoints = 0;

/* ===================== */
/* RENDER WHEEL          */
/* ===================== */
function renderWheel() {
  gameContainer.innerHTML = `
    <div class="left-bar">
      <div id="wheel-info">
        <p id="spin-count">Spins <br> ${categoriesPlayed}/${totalCategories}</p>
        <p id="score-container">Score <br> ${accumulativeScore}</p>
      </div>
    </div>
 

    <div class="middle-bar">
      <div class="wheel-wrapper">
        <p id="result" class="result"></p>
        <div class="border"></div>
        <div id="wheel" class="wheel">
          <div class="wheel-borders"></div>
        </div>
        <div class="spin-button-wrapper">
          <div class="spin-button-inner-border"></div>
          <button id="spinButton" class="spin-button">Spin</button>
        </div>
      </div>
    </div>
  

    <div class="right-bar">
      <div id="leaderboard">
        <div id="leaderboard-inner">
          <div class="leaderboard-title">Top Players</div>
          <ul id="leaderboard-list"></ul>
          <div class="leaderboard-wrapper">
            <div class="leaderboard"> All Players </div>
            <button> <img src="../assets/icons/trophy.png" /> </button>
          </div>
        </div>
      </div>
    </div>

  `;

  updateLeaderboard();
  setupWheel();
}

/* ===================== */
/* ADD ICONS TO WHEEL    */
/* ===================== */
function addWheelIcons(wheel, categories, icons) {
  const segmentCount = categories.length;
  const segmentAngle = 360 / segmentCount;

  // Remove old icons
  wheel.querySelectorAll('.wheel-icon').forEach(i => i.remove());

  function positionIcons() {
    const wheelRect = wheel.getBoundingClientRect();
    const wheelRadius = wheelRect.width / 2;
    const iconDistance = wheelRadius * 0.75; // 75% radius
    const iconSize = wheelRect.width * 0.12; // 12% of wheel

    // Remove existing icons before adding (prevents duplicates)
    wheel.querySelectorAll('.wheel-icon').forEach(i => i.remove());

    categories.forEach((cat, i) => {
      const iconData = icons.find(ic => ic.label.toLowerCase() === cat.name.toLowerCase());
      if (!iconData) return;

      const span = document.createElement('span');
      span.className = 'wheel-icon';
      span.style.width = `${iconSize}px`;
      span.style.height = `${iconSize}px`;

      const angle = segmentAngle * i + segmentAngle / 2 - 90;

      span.style.transform = `
        translate(-50%, -50%)          /* center icon at wheel center */
        rotate(${angle}deg)             /* rotate around wheel center */
        translate(${iconDistance}px)     /* push outward along radius */
        rotate(90deg)                   /* make icon upright */
      `;

      const img = document.createElement('img');
      img.src = iconData.icon;
      img.alt = iconData.label;

      span.appendChild(img);
      wheel.appendChild(span);
    });
  }

  // Initial positioning
  positionIcons();

  // Observe for wheel resize (handles responsive resizing)
  const ro = new ResizeObserver(positionIcons);
  ro.observe(wheel);
}

/* ===================== */
/* SETUP WHEEL           */
/* ===================== */
function setupWheel() {
  const wheel = document.getElementById('wheel');
  const button = document.getElementById('spinButton');
  const resultEl = document.getElementById('result');

  // Clear previous borders
  const bordersContainer = wheel.querySelector('.wheel-borders');
  bordersContainer.innerHTML = '';
  for (let i = 0; i < segmentCount; i++) {
    const line = document.createElement('div');
    line.style.transform = `rotate(${i * segmentAngle}deg)`;
    bordersContainer.appendChild(line);
  }

  // Wheel gradient
  wheel.style.background = `conic-gradient(${categories
    .map((cat, i) => `${cat.color} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`)
    .join(', ')})`;

  // ✅ Add icons
  addWheelIcons(wheel, categories, icons);

  // Remove old listeners
  const newButton = button.cloneNode(true);
  button.parentNode.replaceChild(newButton, button);

  // Spin button
  newButton.addEventListener('click', () => {
    if (spinning) return;
    spinning = true;

    newButton.classList.add('pressed');
    setTimeout(() => newButton.classList.remove('pressed'), 4000);

    const rotations = Math.floor(Math.random() * 5 + 5);
    const randomIndex = Math.floor(Math.random() * segmentCount);
    const targetAngle = randomIndex * segmentAngle + segmentAngle / 2;
    const currentRotationMod = currentRotation % 360;
    const extraDeg = ((targetAngle - currentRotationMod + 360) % 360) + rotations * 360;
    currentRotation += extraDeg;

    wheel.style.transition = 'transform 4s cubic-bezier(0.25,1,0.5,1)';
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
      const normalized = (360 - (currentRotation % 360)) % 360;
      const activeIndex = Math.floor(normalized / segmentAngle) % segmentCount;
      resultEl.textContent = categories[activeIndex].name;

      setTimeout(() => startCategoryQuestions(categories[activeIndex]), 2000);
      spinning = false;
    }, 4000);
  });

  ['touchstart', 'touchend', 'touchcancel'].forEach(event => {
    newButton.addEventListener(event, () =>
      newButton.classList.toggle('pressed', event === 'touchstart')
    );
  });
}

/* ===================== */
/* QUESTIONS SCREEN       */
/* ===================== */
function startCategoryQuestions(category) {
  roundPoints = 0;
  const categoryQuestions = questions[category.name];
  const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
  const questionsToAsk = shuffled.slice(0, 6);
  let currentQuestionIndex = 0;

  function showNextQuestion() {
    const q = questionsToAsk[currentQuestionIndex];

    gameContainer.innerHTML = `
      <div class="left-bar">
        <div id="round-points-container">
          Round Points: <span id="round-value">${roundPoints}</span>
        </div>
      </div>

      <div class="middle-bar">
        <div class="question-wrapper">
          <div class="question-text">${q.question}
           <div id="timer">00:00:20</div> 
          </div>
          <div class="answers-container">
            ${q.answers.map((a, i) => `<button class="answer-btn" data-index="${i}">${a}</button>`).join('')}
          </div>
        </div>
      </div>

      <div class="right-bar"></div>
    `;

    updateLeaderboard();
    startTimer(() => {
      currentQuestionIndex++;
      if (currentQuestionIndex < questionsToAsk.length) showNextQuestion();
      else finishRound();
    });

    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        stopTimer();
        const selected = parseInt(btn.dataset.index);
        const correct = selected === q.correctIndex;

        buttons.forEach(b => (b.disabled = true));
        buttons[q.correctIndex].classList.add('correct');
        if (!correct) btn.classList.add('wrong');

        if (correct) {
          const points = increaseScore(true);
          roundPoints += points;
          document.getElementById('round-value').textContent = roundPoints;
        }

        setTimeout(() => {
          currentQuestionIndex++;
          if (currentQuestionIndex < 6) showNextQuestion();
          else finishRound();
        }, 1200);
      });
    });
  }

  function finishRound() {
    accumulativeScore += roundPoints;
    addToTotal(roundPoints);
    nextCategoryOrEnd();
  }

  showNextQuestion();
}

/* ===================== */
/* GAME OVER             */
/* ===================== */
async function showGameOver() {
  const name = prompt(
    `Game Over!\nYour final score: ${accumulativeScore}\nEnter your name for the leaderboard:`
  );

  if (name) {
    await fetch("https://quiet-feather-6e04.federicolinus.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "saveScore",
        game: "stw",
        name: name,
        score: accumulativeScore
      })
    });
  }

  if (confirm("Play again?")) {
    categoriesPlayed = 0;
    accumulativeScore = 0;
    resetScore();
    renderWheel();
  }
}
// 🔥 Only display top 3 players

/* ===================== */
/* HELPER FUNCTIONS      */
/* ===================== */
async function updateLeaderboard() {
  const leaderboardEl = document.getElementById('leaderboard-list');
  if (!leaderboardEl) return;

  const leaderboard = await fetchLeaderboard();

  const topThree = leaderboard.slice(0, 3);

  leaderboardEl.innerHTML = topThree
    .map(
      (p, i) => `
      <li class="leaderboard-item rank-${i + 1}">
        <span class="player-name">${i + 1}. ${p.name}</span>
        <span class="player-score">${p.score}</span>
      </li>
    `
    )
    .join('');
}

function nextCategoryOrEnd() {
  categoriesPlayed++;
  if (categoriesPlayed < totalCategories) renderWheel();
  else showGameOver();
}

/* ===================== */
/* START GAME            */
/* ===================== */
renderWheel();
