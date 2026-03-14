// 게임 상태 변수
let diceValues = [1, 1, 1, 1, 1];
let heldDice = [false, false, false, false, false];
let remainingRolls = 3;
let turnsRemaining = 12; // 총 12개의 카테고리
let scores = {}; // 확정된 점수 저장

const categories = [
  'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
  'choice', 'four-of-a-kind', 'full-house', 'small-straight', 'large-straight', 'yacht'
];

// DOM 요소
const diceElements = document.querySelectorAll('.dice');
const rollButton = document.getElementById('roll-button');
const scoreCells = document.querySelectorAll('.score-cell');
const subtotalEl = document.getElementById('subtotal');
const bonusEl = document.getElementById('bonus');
const totalScoreEl = document.getElementById('total-score');
const gameOverModal = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

// 초기화
function initGame() {
  scores = {};
  remainingRolls = 3;
  turnsRemaining = 12;
  heldDice = [false, false, false, false, false];
  diceValues = [1, 1, 1, 1, 1];
  
  scoreCells.forEach(cell => {
    cell.textContent = '-';
    cell.classList.remove('confirmed', 'potential');
  });
  
  updateDiceUI();
  updateRollButtonUI();
  updateTotalScores();
  gameOverModal.classList.add('hidden');
}

// 주사위 굴리기
function rollDice() {
  if (remainingRolls <= 0) return;

  for (let i = 0; i < 5; i++) {
    if (!heldDice[i]) {
      diceValues[i] = Math.floor(Math.random() * 6) + 1;
    }
  }
  
  remainingRolls--;
  updateDiceUI();
  updateRollButtonUI();
  showPotentialScores();
}

// 주사위 고정/해제
function toggleHold(index) {
  if (remainingRolls === 3) return; // 굴리기 전에는 고정 불가
  heldDice[index] = !heldDice[index];
  updateDiceUI();
}

// UI 업데이트
function updateDiceUI() {
  diceElements.forEach((el, i) => {
    el.textContent = diceValues[i];
    el.classList.toggle('held', heldDice[i]);
  });
}

function updateRollButtonUI() {
  rollButton.textContent = `주사위 굴리기 (남은 횟수: ${remainingRolls})`;
  rollButton.disabled = remainingRolls === 0;
}

// 점수 계산 로직
function calculateScore(category, dice) {
  const counts = {};
  dice.forEach(d => counts[d] = (counts[d] || 0) + 1);
  const sum = dice.reduce((a, b) => a + b, 0);
  const uniqueDice = [...new Set(dice)].sort();

  switch (category) {
    case 'ones': return (counts[1] || 0) * 1;
    case 'twos': return (counts[2] || 0) * 2;
    case 'threes': return (counts[3] || 0) * 3;
    case 'fours': return (counts[4] || 0) * 4;
    case 'fives': return (counts[5] || 0) * 5;
    case 'sixes': return (counts[6] || 0) * 6;
    case 'choice': return sum;
    case 'four-of-a-kind':
      return Object.values(counts).some(c => c >= 4) ? sum : 0;
    case 'full-house':
      const vals = Object.values(counts);
      return (vals.includes(3) && vals.includes(2)) || vals.includes(5) ? sum : 0;
    case 'small-straight':
      const sStr = uniqueDice.join('');
      return /1234|2345|3456/.test(sStr) || (uniqueDice.length >= 4 && checkContinuous(uniqueDice, 4)) ? 15 : 0;
    case 'large-straight':
      const lStr = uniqueDice.join('');
      return /12345|23456/.test(lStr) ? 30 : 0;
    case 'yacht':
      return Object.values(counts).includes(5) ? 50 : 0;
    default: return 0;
  }
}

function checkContinuous(arr, target) {
  let count = 1;
  let maxCount = 1;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i+1] === arr[i] + 1) {
      count++;
    } else {
      count = 1;
    }
    maxCount = Math.max(maxCount, count);
  }
  return maxCount >= target;
}

// 잠재적 점수 표시
function showPotentialScores() {
  categories.forEach(cat => {
    if (scores[cat] === undefined) {
      const cell = document.getElementById(`score-${cat}`);
      cell.textContent = calculateScore(cat, diceValues);
      cell.classList.add('potential');
    }
  });
}

// 점수 선택
function selectScore(category) {
  if (remainingRolls === 3) return; // 한 번은 굴려야 함
  if (scores[category] !== undefined) return;

  scores[category] = calculateScore(category, diceValues);
  const cell = document.getElementById(`score-${category}`);
  cell.textContent = scores[category];
  cell.classList.remove('potential');
  cell.classList.add('confirmed');

  turnsRemaining--;
  resetTurn();
  updateTotalScores();
  
  if (turnsRemaining === 0) {
    endGame();
  }
}

function resetTurn() {
  remainingRolls = 3;
  heldDice = [false, false, false, false, false];
  diceValues = [0, 0, 0, 0, 0]; // 초기화 표시
  
  // 아직 확정되지 않은 칸들 초기화
  scoreCells.forEach(cell => {
    if (!cell.classList.contains('confirmed')) {
      cell.textContent = '-';
      cell.classList.remove('potential');
    }
  });
  
  diceElements.forEach(el => {
    el.textContent = '?';
    el.classList.remove('held');
  });
  
  updateRollButtonUI();
}

function updateTotalScores() {
  let upperSum = 0;
  ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'].forEach(cat => {
    upperSum += (scores[cat] || 0);
  });
  
  subtotalEl.textContent = `${upperSum} / 63`;
  const bonus = upperSum >= 63 ? 35 : 0;
  bonusEl.textContent = bonus;
  
  let total = upperSum + bonus;
  ['choice', 'four-of-a-kind', 'full-house', 'small-straight', 'large-straight', 'yacht'].forEach(cat => {
    total += (scores[cat] || 0);
  });
  
  totalScoreEl.textContent = total;
}

function endGame() {
  finalScoreEl.textContent = totalScoreEl.textContent;
  gameOverModal.classList.remove('hidden');
}

// 이벤트 리스너
rollButton.addEventListener('click', rollDice);

diceElements.forEach((el, i) => {
  el.addEventListener('click', () => toggleHold(i));
});

scoreCells.forEach(cell => {
  cell.parentElement.addEventListener('click', () => {
    const category = cell.parentElement.getAttribute('data-category');
    if (category) selectScore(category);
  });
});

restartButton.addEventListener('click', initGame);

// 초기 실행
initGame();
