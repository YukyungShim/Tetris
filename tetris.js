/**
 * NEON ARCADE TETRIS (1988 Tengen Arcade Tribute)
 * Full Game Engine with Web Audio SFX, YouTube BGM (Korobeiniki Synthwave),
 * Canvas Neon Effects, SRS Wall Kicks, Stage/Garbage Map System, and Supabase Leaderboard.
 */

// --- 1. DOM 요소 취득 ---
const mainCanvas = document.querySelector('#mainCanvas');
const ctx = mainCanvas.getContext('2d');
const holdCanvas = document.querySelector('#holdCanvas');
const holdCtx = holdCanvas.getContext('2d');
const nextCanvas1 = document.querySelector('#nextCanvas1');
const nextCtx1 = nextCanvas1.getContext('2d');
const nextCanvas2 = document.querySelector('#nextCanvas2');
const nextCtx2 = nextCanvas2.getContext('2d');
const nextCanvas3 = document.querySelector('#nextCanvas3');
const nextCtx3 = nextCanvas3.getContext('2d');

const scoreDisplay = document.querySelector('#scoreDisplay');
const roundDisplay = document.querySelector('#roundDisplay');
const linesLeftDisplay = document.querySelector('#linesLeftDisplay');
const statusMessage = document.querySelector('#statusMessage');

const rankingList = document.querySelector('#rankingList');
const rankNotice = document.querySelector('#rankNotice');
const startScreen = document.querySelector('#startScreen');
const startGameBtn = document.querySelector('#startGameBtn');
const playerNameInput = document.querySelector('#playerName');
const nameError = document.querySelector('#nameError');

const resultScreen = document.querySelector('#resultScreen');
const resultKicker = document.querySelector('#resultKicker');
const resultTitle = document.querySelector('#resultTitle');
const resultScore = document.querySelector('#resultScore');
const resultDetails = document.querySelector('#resultDetails');
const saveScoreBtn = document.querySelector('#saveScoreBtn');
const skipScoreBtn = document.querySelector('#skipScoreBtn');

const restartBtn = document.querySelector('#restartBtn');
const pauseBtn = document.querySelector('#pauseBtn');

// 상단 오디오 컨트롤 버튼
const bgmToggleBtn = document.querySelector('#bgmToggleBtn');
const sfxToggleBtn = document.querySelector('#sfxToggleBtn');
const muteAllBtn = document.querySelector('#muteAllBtn');

// 모바일 컨트롤러 버튼
const btnMvLeft = document.querySelector('#btnMvLeft');
const btnMvRight = document.querySelector('#btnMvRight');
const btnSoftDrop = document.querySelector('#btnSoftDrop');
const btnRotCw = document.querySelector('#btnRotCw');
const btnHardDrop = document.querySelector('#btnHardDrop');
const btnHold = document.querySelector('#btnHold');

// --- 2. 게임 상수 및 스펙 ---
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const LINES_PER_ROUND = 15;
const LOCAL_STORAGE_KEY = 'neon-tetris-scores';

// 테트로미노 정의 (SRS 표준 형태 및 네온 컬러)
const TETROMINOES = {
  I: {
    name: 'I',
    color: '#34e7ff',
    glow: 'rgba(52, 231, 255, 0.9)',
    shapes: [
      [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
      [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
      [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]]
    ]
  },
  J: {
    name: 'J',
    color: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.9)',
    shapes: [
      [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
      [[0, 1, 0], [0, 1, 0], [1, 1, 0]]
    ]
  },
  L: {
    name: 'L',
    color: '#ff9f43',
    glow: 'rgba(255, 159, 67, 0.9)',
    shapes: [
      [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
      [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
      [[1, 1, 0], [0, 1, 0], [0, 1, 0]]
    ]
  },
  O: {
    name: 'O',
    color: '#ffe566',
    glow: 'rgba(255, 229, 102, 0.9)',
    shapes: [
      [[1, 1], [1, 1]],
      [[1, 1], [1, 1]],
      [[1, 1], [1, 1]],
      [[1, 1], [1, 1]]
    ]
  },
  S: {
    name: 'S',
    color: '#58f299',
    glow: 'rgba(88, 242, 153, 0.9)',
    shapes: [
      [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
      [[0, 0, 0], [0, 1, 1], [1, 1, 0]],
      [[1, 0, 0], [1, 1, 0], [0, 1, 0]]
    ]
  },
  T: {
    name: 'T',
    color: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.9)',
    shapes: [
      [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
      [[0, 1, 0], [1, 1, 0], [0, 1, 0]]
    ]
  },
  Z: {
    name: 'Z',
    color: '#ff4cb8',
    glow: 'rgba(255, 76, 184, 0.9)',
    shapes: [
      [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
      [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 0], [0, 1, 1]],
      [[0, 1, 0], [1, 1, 0], [1, 0, 0]]
    ]
  }
};

const TETRO_KEYS = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

// SRS Wall Kick 오프셋 데이터
const WALL_KICKS_JLSTZ = [
  [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]]
];

const WALL_KICKS_I = [
  [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]]
];

// --- 3. 오디오 & BGM 관리 시스템 ---
const bgmAudio = document.querySelector('#bgmAudio') || new Audio('bgm.mp3');
bgmAudio.loop = true;
bgmAudio.volume = 0.45;

let audioCtx = null;
let sfxEnabled = true;
let bgmEnabled = true;
let isMutedAll = false;

function playBGM() {
  if (isMutedAll || !bgmEnabled) return;
  try {
    const playPromise = bgmAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        // 사용자 인터랙션 전 자동재생 방지 정책 처리
      });
    }
  } catch (e) {
    console.warn('BGM Play Error:', e);
  }
}

function pauseBGM() {
  try {
    bgmAudio.pause();
  } catch (e) {
    console.warn('BGM Pause Error:', e);
  }
}

function stopBGM() {
  try {
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
  } catch (e) {
    console.warn('BGM Stop Error:', e);
  }
}

function updateAudioButtons() {
  if (isMutedAll) {
    muteAllBtn.classList.add('muted');
    muteAllBtn.textContent = '🔇 MUTED';
    bgmToggleBtn.classList.remove('active');
    sfxToggleBtn.classList.remove('active');
  } else {
    muteAllBtn.classList.remove('muted');
    muteAllBtn.textContent = '🔇 MUTE ALL';

    if (bgmEnabled) {
      bgmToggleBtn.classList.add('active');
      bgmToggleBtn.textContent = '🎵 BGM ON';
    } else {
      bgmToggleBtn.classList.remove('active');
      bgmToggleBtn.textContent = '🎵 BGM OFF';
    }

    if (sfxEnabled) {
      sfxToggleBtn.classList.add('active');
      sfxToggleBtn.textContent = '🔊 SFX ON';
    } else {
      sfxToggleBtn.classList.remove('active');
      sfxToggleBtn.textContent = '🔊 SFX OFF';
    }
  }
}

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  if (bgmEnabled && !isMutedAll) {
    playBGM();
  }
}

function playSound(type) {
  if (isMutedAll || !sfxEnabled || !audioCtx) return;
  try {
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    switch (type) {
      case 'move':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(160, t + 0.05);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;

      case 'rotate':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.07);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);
        osc.start(t);
        osc.stop(t + 0.07);
        break;

      case 'hardDrop':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.12);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc.start(t);
        osc.stop(t + 0.12);
        break;

      case 'lock':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.08);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        osc.start(t);
        osc.stop(t + 0.08);
        break;

      case 'clear':
        osc.type = 'square';
        osc.frequency.setValueAtTime(523.25, t);
        osc.frequency.setValueAtTime(659.25, t + 0.07);
        osc.frequency.setValueAtTime(783.99, t + 0.14);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
        osc.start(t);
        osc.stop(t + 0.22);
        break;

      case 'tetris':
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);

        osc.type = 'sawtooth';
        osc2.type = 'square';
        osc.frequency.setValueAtTime(523.25, t);
        osc.frequency.setValueAtTime(659.25, t + 0.08);
        osc.frequency.setValueAtTime(783.99, t + 0.16);
        osc.frequency.setValueAtTime(1046.5, t + 0.24);

        osc2.frequency.setValueAtTime(261.63, t);
        osc2.frequency.setValueAtTime(329.63, t + 0.08);
        osc2.frequency.setValueAtTime(392.0, t + 0.16);
        osc2.frequency.setValueAtTime(523.25, t + 0.24);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);
        gain2.gain.setValueAtTime(0.2, t);
        gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.45);

        osc.start(t);
        osc.stop(t + 0.45);
        osc2.start(t);
        osc2.stop(t + 0.45);
        break;

      case 'stageClear':
        [0, 0.1, 0.2, 0.3].forEach((delay, i) => {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.connect(g);
          g.connect(audioCtx.destination);
          o.type = 'triangle';
          o.frequency.setValueAtTime([523, 659, 784, 1046][i], t + delay);
          g.gain.setValueAtTime(0.25, t + delay);
          g.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.18);
          o.start(t + delay);
          o.stop(t + delay + 0.18);
        });
        break;

      case 'gameover':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.6);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
        osc.start(t);
        osc.stop(t + 0.6);
        break;
    }
  } catch (e) {
    console.error('Audio play error:', e);
  }
}

// --- 4. 게임 상태 변수 ---
let board = [];
let currentPiece = null;
let holdPiece = null;
let canHold = true;
let nextQueue = [];
let bag = [];

let score = 0;
let round = 1;
let linesLeft = LINES_PER_ROUND;
let totalLines = 0;
let totalTetris = 0;
let combo = -1;
let backToBack = false;

let isRunning = false;
let isPaused = false;
let isGameOver = false;

let lastDropTime = 0;
let animationFrameId = null;
let playerName = '';
let personalBest = null;

// 파티클, 레이저 및 플로팅 이펙트
let particles = [];
let laserLines = [];
let floatingTexts = [];
let screenShake = 0;

// --- 5. 1988 Tengen 아케이드 맵 & 스테이지 Garbage 생성기 ---
function generateStageGarbage(stageRound) {
  const newBoard = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  const garbageBlock = {
    color: '#475569',
    outline: '#ff5c5c',
    glow: 'rgba(255, 92, 92, 0.7)',
    isGarbage: true
  };

  if (stageRound <= 3) {
    return newBoard;
  }

  const fillRow = (rowIdx, pattern) => {
    for (let c = 0; c < COLS; c++) {
      if (pattern[c]) {
        newBoard[rowIdx][c] = { ...garbageBlock };
      }
    }
  };

  if (stageRound >= 4 && stageRound <= 6) {
    fillRow(19, [1, 1, 1, 1, 0, 0, 1, 1, 1, 1]);
    fillRow(18, [1, 1, 1, 0, 0, 0, 0, 1, 1, 1]);
    fillRow(17, [1, 1, 0, 0, 0, 0, 0, 0, 1, 1]);
  } else if (stageRound >= 7 && stageRound <= 9) {
    fillRow(19, [1, 0, 1, 0, 1, 0, 1, 0, 1, 0]);
    fillRow(18, [0, 1, 0, 1, 0, 1, 0, 1, 0, 1]);
    fillRow(17, [1, 0, 1, 0, 1, 0, 1, 0, 1, 0]);
    fillRow(16, [0, 1, 0, 1, 0, 1, 0, 1, 0, 1]);
  } else if (stageRound >= 10 && stageRound <= 12) {
    fillRow(19, [1, 1, 1, 0, 0, 0, 0, 1, 1, 1]);
    fillRow(18, [1, 1, 0, 0, 0, 0, 0, 0, 1, 1]);
    fillRow(17, [1, 1, 0, 0, 1, 1, 0, 0, 1, 1]);
    fillRow(16, [1, 0, 0, 0, 1, 1, 0, 0, 0, 1]);
    fillRow(15, [1, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
  } else if (stageRound >= 13 && stageRound <= 15) {
    for (let r = 0; r < 6; r++) {
      const row = 19 - r;
      const shift = r % 4;
      const pat = Array(COLS).fill(0);
      for (let c = 0; c < COLS; c++) {
        if ((c + shift) % 3 !== 0) pat[c] = 1;
      }
      pat[(r * 2) % COLS] = 0;
      fillRow(row, pat);
    }
  } else if (stageRound >= 16 && stageRound <= 18) {
    for (let r = 19; r >= 14; r--) {
      const pat = Array(COLS).fill(1);
      const holes = [Math.floor(Math.random() * 5), Math.floor(5 + Math.random() * 5)];
      holes.forEach(h => { pat[h] = 0; });
      fillRow(r, pat);
    }
  } else {
    const height = Math.min(8, 6 + Math.floor((stageRound - 18) / 2));
    for (let r = 19; r >= 20 - height; r--) {
      const pat = Array(COLS).fill(1);
      const holesCount = 2 + (r % 2);
      for (let k = 0; k < holesCount; k++) {
        pat[Math.floor(Math.random() * COLS)] = 0;
      }
      fillRow(r, pat);
    }
  }

  return newBoard;
}

function getGravitySpeed(currRound) {
  return Math.max(80, 800 - (currRound - 1) * 45);
}

// --- 6. 7-Bag 무작위 생성기 ---
function refillBag() {
  const pieces = [...TETRO_KEYS];
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  bag.push(...pieces);
}

function getNextPieceType() {
  if (bag.length < 7) {
    refillBag();
  }
  return bag.shift();
}

function createPiece(type) {
  const t = TETROMINOES[type];
  return {
    type: type,
    color: t.color,
    glow: t.glow,
    rotation: 0,
    matrix: t.shapes[0],
    x: Math.floor((COLS - t.shapes[0][0].length) / 2),
    y: type === 'I' ? -1 : 0
  };
}

// --- 7. 충돌 판정 및 월킥 (SRS) ---
function checkCollision(piece, b = board, offsetX = 0, offsetY = 0, testMatrix = null) {
  const matrix = testMatrix || piece.matrix;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) {
        const newX = piece.x + c + offsetX;
        const newY = piece.y + r + offsetY;

        if (newX < 0 || newX >= COLS || newY >= ROWS) {
          return true;
        }

        if (newY >= 0 && b[newY][newX] !== null) {
          return true;
        }
      }
    }
  }
  return false;
}

function rotatePiece(direction = 1) {
  if (!currentPiece) return;

  const type = currentPiece.type;
  if (type === 'O') return;

  const shapes = TETROMINOES[type].shapes;
  const currentRot = currentPiece.rotation;
  const nextRot = (currentRot + direction + 4) % 4;
  const nextMatrix = shapes[nextRot];

  const kickTable = (type === 'I') ? WALL_KICKS_I : WALL_KICKS_JLSTZ;
  const kickIndex = direction === 1 ? currentRot : nextRot;
  const rawKicks = kickTable[kickIndex];

  for (let i = 0; i < rawKicks.length; i++) {
    const [kx, ky] = rawKicks[i];
    const dx = direction === 1 ? kx : -kx;
    const dy = direction === 1 ? -ky : ky;

    if (!checkCollision(currentPiece, board, dx, dy, nextMatrix)) {
      currentPiece.x += dx;
      currentPiece.y += dy;
      currentPiece.rotation = nextRot;
      currentPiece.matrix = nextMatrix;
      playSound('rotate');
      return;
    }
  }
}

function getGhostPiece() {
  if (!currentPiece) return null;
  const ghost = { ...currentPiece };
  let dropOffset = 0;
  while (!checkCollision(ghost, board, 0, dropOffset + 1)) {
    dropOffset++;
  }
  ghost.y += dropOffset;
  return ghost;
}

// --- 8. 조작 로직 ---
function moveLeft() {
  if (!isRunning || isPaused || isGameOver || !currentPiece) return;
  if (!checkCollision(currentPiece, board, -1, 0)) {
    currentPiece.x--;
    playSound('move');
  }
}

function moveRight() {
  if (!isRunning || isPaused || isGameOver || !currentPiece) return;
  if (!checkCollision(currentPiece, board, 1, 0)) {
    currentPiece.x++;
    playSound('move');
  }
}

function softDrop() {
  if (!isRunning || isPaused || isGameOver || !currentPiece) return;
  if (!checkCollision(currentPiece, board, 0, 1)) {
    currentPiece.y++;
    score += 1;
    updateHud();
    playSound('move');
  } else {
    lockPiece();
  }
}

function hardDrop() {
  if (!isRunning || isPaused || isGameOver || !currentPiece) return;
  let droppedCells = 0;
  while (!checkCollision(currentPiece, board, 0, 1)) {
    currentPiece.y++;
    droppedCells++;
  }
  score += droppedCells * 2;
  playSound('hardDrop');
  createHardDropParticles(currentPiece);
  screenShake = 3;
  lockPiece();
}

function hold() {
  if (!isRunning || isPaused || isGameOver || !canHold || !currentPiece) return;

  playSound('rotate');
  const currentType = currentPiece.type;

  if (holdPiece === null) {
    holdPiece = currentType;
    spawnPiece();
  } else {
    const temp = holdPiece;
    holdPiece = currentType;
    currentPiece = createPiece(temp);
  }

  canHold = false;
  drawHoldPreview();
}

function lockPiece() {
  if (!currentPiece) return;

  const { matrix, x, y, color, glow } = currentPiece;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) {
        const boardY = y + r;
        const boardX = x + c;
        if (boardY < 0) {
          finishGame(false);
          return;
        }
        board[boardY][boardX] = { color, glow };
      }
    }
  }

  playSound('lock');
  canHold = true;
  clearLines();
  spawnPiece();
}

function clearLines() {
  const fullRows = [];
  for (let r = 0; r < ROWS; r++) {
    if (board[r].every(cell => cell !== null)) {
      fullRows.push(r);
    }
  }

  const linesCount = fullRows.length;
  if (linesCount === 0) {
    combo = -1;
    return;
  }

  combo++;

  let baseScore = 0;
  let text = '';
  let color = '#34e7ff';

  if (linesCount === 1) {
    baseScore = 100 * round;
    text = `SINGLE +${baseScore}`;
    backToBack = false;
    playSound('clear');
  } else if (linesCount === 2) {
    baseScore = 300 * round;
    text = `DOUBLE +${baseScore}`;
    color = '#58f299';
    backToBack = false;
    playSound('clear');
  } else if (linesCount === 3) {
    baseScore = 500 * round;
    text = `TRIPLE +${baseScore}`;
    color = '#ffe566';
    backToBack = false;
    playSound('clear');
  } else if (linesCount === 4) {
    baseScore = 800 * round;
    if (backToBack) {
      baseScore = Math.floor(baseScore * 1.5);
      text = `B2B TETRIS! +${baseScore}`;
      color = '#ff4cb8';
    } else {
      text = `⚡ TETRIS! +${baseScore}`;
      color = '#c084fc';
    }
    backToBack = true;
    totalTetris++;
    screenShake = 7;
    playSound('tetris');
  }

  if (combo > 0) {
    const comboBonus = 50 * combo * round;
    baseScore += comboBonus;
    text += ` | ${combo + 1} COMBO!`;
  }

  score += baseScore;
  totalLines += linesCount;
  linesLeft -= linesCount;

  addFloatingText(150, fullRows[0] * BLOCK_SIZE, text, color);
  fullRows.forEach(r => {
    createLineClearParticles(r);
    laserLines.push({ y: r * BLOCK_SIZE + BLOCK_SIZE / 2, alpha: 1.0, color });
  });

  for (let i = 0; i < fullRows.length; i++) {
    const r = fullRows[i];
    board.splice(r, 1);
    board.unshift(Array(COLS).fill(null));
  }

  if (linesLeft <= 0) {
    stageClear();
  }

  updateHud();
}

function stageClear() {
  round++;
  linesLeft = LINES_PER_ROUND;
  score += 1000 * round;
  playSound('stageClear');

  addFloatingText(150, 200, `🎉 STAGE ${round - 1} CLEARED!`, '#ffe566');
  statusMessage.textContent = `ROUND ${round} 진입! 속도가 빨라집니다.`;

  board = generateStageGarbage(round);
  updateHud();
}

function spawnPiece() {
  if (nextQueue.length < 5) {
    while (nextQueue.length < 5) {
      nextQueue.push(getNextPieceType());
    }
  }

  const nextType = nextQueue.shift();
  currentPiece = createPiece(nextType);

  drawNextPreviews();

  if (checkCollision(currentPiece, board)) {
    finishGame(false);
  }
}

// --- 9. 파티클 및 시각 효과 ---
function createHardDropParticles(piece) {
  const { matrix, x, y, color } = piece;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) {
        const px = (x + c) * BLOCK_SIZE + BLOCK_SIZE / 2;
        const py = (y + r) * BLOCK_SIZE + BLOCK_SIZE;
        for (let i = 0; i < 4; i++) {
          particles.push({
            x: px + (Math.random() - 0.5) * 20,
            y: py,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 3,
            alpha: 1.0,
            color: color,
            size: Math.random() * 3 + 2
          });
        }
      }
    }
  }
}

function createLineClearParticles(row) {
  const py = row * BLOCK_SIZE + BLOCK_SIZE / 2;
  for (let i = 0; i < 30; i++) {
    particles.push({
      x: Math.random() * (COLS * BLOCK_SIZE),
      y: py + (Math.random() - 0.5) * 16,
      vx: (Math.random() - 0.5) * 7,
      vy: (Math.random() - 0.5) * 6,
      alpha: 1.0,
      color: ['#34e7ff', '#ff4cb8', '#ffe566', '#ffffff'][Math.floor(Math.random() * 4)],
      size: Math.random() * 4 + 2
    });
  }
}

function addFloatingText(x, y, text, color) {
  floatingTexts.push({
    x,
    y: Math.max(40, Math.min(560, y)),
    text,
    color,
    alpha: 1.0,
    vy: -1.2
  });
}

// --- 10. 캔버스 렌더링 엔진 ---
function drawBlock(c, x, y, size, color, glow, isGhost = false, isGarbage = false) {
  c.save();
  const px = x * size;
  const py = y * size;

  if (isGhost) {
    c.strokeStyle = color;
    c.shadowColor = color;
    c.shadowBlur = 6;
    c.lineWidth = 1.5;
    c.strokeRect(px + 2, py + 2, size - 4, size - 4);
    c.fillStyle = 'rgba(52, 231, 255, 0.08)';
    c.fillRect(px + 2, py + 2, size - 4, size - 4);
    c.restore();
    return;
  }

  c.shadowColor = glow || color;
  c.shadowBlur = isGarbage ? 4 : 10;
  c.fillStyle = color;
  c.fillRect(px + 1, py + 1, size - 2, size - 2);

  c.shadowBlur = 0;
  c.fillStyle = 'rgba(255, 255, 255, 0.4)';
  c.fillRect(px + 3, py + 3, size - 6, 3);
  c.fillRect(px + 3, py + 3, 3, size - 6);

  c.fillStyle = 'rgba(0, 0, 0, 0.3)';
  c.fillRect(px + size - 5, py + 3, 3, size - 6);
  c.fillRect(px + 3, py + size - 5, size - 6, 3);

  if (isGarbage) {
    c.strokeStyle = '#ff5c5c';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(px + 4, py + 4);
    c.lineTo(px + size - 4, py + size - 4);
    c.moveTo(px + size - 4, py + 4);
    c.lineTo(px + 4, py + size - 4);
    c.stroke();
  }

  c.restore();
}

function render() {
  ctx.save();
  ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

  if (screenShake > 0) {
    const shakeX = (Math.random() - 0.5) * screenShake * 2;
    const shakeY = (Math.random() - 0.5) * screenShake * 2;
    ctx.translate(shakeX, shakeY);
    screenShake *= 0.85;
    if (screenShake < 0.2) screenShake = 0;
  }

  // 1. 네온 그리드 배경
  ctx.strokeStyle = 'rgba(52, 231, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * BLOCK_SIZE, 0);
    ctx.lineTo(c * BLOCK_SIZE, ROWS * BLOCK_SIZE);
    ctx.stroke();
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * BLOCK_SIZE);
    ctx.lineTo(COLS * BLOCK_SIZE, r * BLOCK_SIZE);
    ctx.stroke();
  }

  // 2. 보드에 쌓인 블록
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      if (cell) {
        drawBlock(ctx, c, r, BLOCK_SIZE, cell.color, cell.glow, false, cell.isGarbage);
      }
    }
  }

  // 3. 고스트 피스
  if (currentPiece && !isGameOver && !isPaused) {
    const ghost = getGhostPiece();
    if (ghost) {
      const { matrix, x, y, color } = ghost;
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c] && y + r >= 0) {
            drawBlock(ctx, x + c, y + r, BLOCK_SIZE, color, null, true);
          }
        }
      }
    }
  }

  // 4. 현재 피스
  if (currentPiece && !isGameOver) {
    const { matrix, x, y, color, glow } = currentPiece;
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] && y + r >= 0) {
          drawBlock(ctx, x + c, y + r, BLOCK_SIZE, color, glow);
        }
      }
    }
  }

  // 5. 레이저 빔
  laserLines.forEach(l => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, l.alpha);
    ctx.strokeStyle = l.color;
    ctx.shadowColor = l.color;
    ctx.shadowBlur = 18;
    ctx.lineWidth = 14 * l.alpha;
    ctx.beginPath();
    ctx.moveTo(0, l.y);
    ctx.lineTo(mainCanvas.width, l.y);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4 * l.alpha;
    ctx.stroke();
    ctx.restore();
  });

  // 6. 파티클
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 7. 플로팅 텍스트
  floatingTexts.forEach(ft => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.fillStyle = ft.color;
    ctx.shadowColor = ft.color;
    ctx.shadowBlur = 10;
    ctx.font = 'bold 15px Space Mono';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  });

  // 8. 일시정지 오버레이
  if (isPaused) {
    ctx.fillStyle = 'rgba(6, 8, 26, 0.75)';
    ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    ctx.fillStyle = '#ffe566';
    ctx.font = '24px Black Ops One';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ffe566';
    ctx.shadowBlur = 12;
    ctx.fillText('PAUSED', mainCanvas.width / 2, mainCanvas.height / 2);
  }

  ctx.restore();
}

function drawPreviewPiece(targetCtx, canvasWidth, canvasHeight, type, scale = 18) {
  targetCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  if (!type) return;

  const t = TETROMINOES[type];
  const matrix = t.shapes[0];
  const rows = matrix.length;
  const cols = matrix[0].length;

  const startX = (canvasWidth - cols * scale) / 2;
  const startY = (canvasHeight - rows * scale) / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c]) {
        drawBlock(targetCtx, (startX / scale) + c, (startY / scale) + r, scale, t.color, t.glow);
      }
    }
  }
}

function drawHoldPreview() {
  drawPreviewPiece(holdCtx, holdCanvas.width, holdCanvas.height, holdPiece, 18);
}

function drawNextPreviews() {
  drawPreviewPiece(nextCtx1, nextCanvas1.width, nextCanvas1.height, nextQueue[0], 18);
  drawPreviewPiece(nextCtx2, nextCanvas2.width, nextCanvas2.height, nextQueue[1], 12);
  drawPreviewPiece(nextCtx3, nextCanvas3.width, nextCanvas3.height, nextQueue[2], 12);
}

// --- 11. 메인 게임 루프 (Tick) ---
function gameLoop(timestamp) {
  if (!isRunning) return;

  if (!isPaused && !isGameOver) {
    const gravity = getGravitySpeed(round);
    if (timestamp - lastDropTime > gravity) {
      if (currentPiece) {
        if (!checkCollision(currentPiece, board, 0, 1)) {
          currentPiece.y++;
        } else {
          lockPiece();
        }
      }
      lastDropTime = timestamp;
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.03;
      if (p.alpha <= 0) particles.splice(i, 1);
    }

    for (let i = laserLines.length - 1; i >= 0; i--) {
      laserLines[i].alpha -= 0.05;
      if (laserLines[i].alpha <= 0) laserLines.splice(i, 1);
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.025;
      if (ft.alpha <= 0) floatingTexts.splice(i, 1);
    }
  }

  render();
  animationFrameId = requestAnimationFrame(gameLoop);
}

// --- 12. UI 업데이트 및 게임 제어 ---
function updateHud() {
  scoreDisplay.textContent = String(score).padStart(8, '0');
  roundDisplay.textContent = String(round).padStart(2, '0');
  linesLeftDisplay.textContent = String(Math.max(0, linesLeft)).padStart(2, '0');
}

function resetGame() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  board = generateStageGarbage(1);
  round = 1;
  linesLeft = LINES_PER_ROUND;
  score = 0;
  totalLines = 0;
  totalTetris = 0;
  combo = -1;
  backToBack = false;
  holdPiece = null;
  canHold = true;
  nextQueue = [];
  bag = [];
  particles = [];
  laserLines = [];
  floatingTexts = [];
  screenShake = 0;

  isRunning = true;
  isPaused = false;
  isGameOver = false;

  lastDropTime = performance.now();

  drawHoldPreview();
  refillBag();
  refillBag();
  spawnPiece();
  updateHud();

  statusMessage.textContent = '블록을 쌓아 라인을 제거하세요!';
  playBGM();
  animationFrameId = requestAnimationFrame(gameLoop);
}

function togglePause() {
  if (!isRunning || isGameOver) return;
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? 'RESUME' : 'PAUSE';
  statusMessage.textContent = isPaused ? '일시정지됨' : '게임 진행 중';

  if (isPaused) {
    pauseBGM();
  } else {
    lastDropTime = performance.now();
    playBGM();
  }
  render();
}

function finishGame(isVictory = false) {
  isRunning = false;
  isGameOver = true;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  pauseBGM();
  playSound('gameover');

  const isNewBest = score > 0 && (personalBest === null || score > personalBest);
  resultKicker.textContent = isNewBest ? 'NEW PERSONAL BEST!' : 'GAME OVER';
  resultTitle.textContent = isNewBest ? 'HIGH SCORE!' : 'RESULT';
  resultScore.textContent = `${score.toLocaleString()} PTS`;
  resultDetails.textContent = `ROUND ${String(round).padStart(2, '0')} · ${totalLines} LINES · ${totalTetris} TETRIS`;

  resultScreen.classList.remove('hidden');
  render();
}

// --- 13. 랭킹 시스템 (Supabase API & LocalStorage Fallback) ---
function setLocalScore(entry) {
  const normalizedEntry = {
    name: entry.name,
    score: entry.score,
    round_reached: entry.round_reached || entry.round || 1,
    lines_cleared: entry.lines_cleared || entry.lines || 0,
    played_at: new Date().toISOString()
  };
  const scores = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  const previous = scores.find(item => item.name.toLowerCase() === normalizedEntry.name.toLowerCase());
  const candidate = previous && previous.score >= normalizedEntry.score ? previous : normalizedEntry;
  const next = [...scores.filter(item => item.name.toLowerCase() !== normalizedEntry.name.toLowerCase()), candidate];
  next.sort((a, b) => b.score - a.score);
  const top = next.slice(0, 10);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(top));
  return top;
}

function renderScores(scores) {
  rankingList.innerHTML = scores.length
    ? scores
        .map(
          s => `
      <li class="rank-row">
        <span class="p-name">${escapeHtml(s.name)}</span>
        <span class="p-round">R${String(s.round_reached || s.round || 1).padStart(2, '0')}</span>
        <b class="p-score">${Number(s.score).toLocaleString()}</b>
      </li>
    `
        )
        .join('')
    : '<li class="empty">아직 등록된 점수가 없습니다.</li>';
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

async function loadScores() {
  try {
    const res = await fetch('/api/leaderboard');
    if (!res.ok) throw new Error('API offline');
    const data = await res.json();
    renderScores(data.scores || []);
    rankNotice.textContent = '⚡ 글로벌 리더보드 연동 완료';
  } catch (err) {
    const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    renderScores(local);
    rankNotice.textContent = '로컬 랭킹 모드로 동작 중';
  }
}

async function loadPersonalBest() {
  try {
    const res = await fetch(`/api/leaderboard?name=${encodeURIComponent(playerName)}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    personalBest = Number.isFinite(data.personalBest) ? data.personalBest : null;
  } catch {
    const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    personalBest = local.find(item => item.name.toLowerCase() === playerName.toLowerCase())?.score ?? null;
  }
}

async function submitScore() {
  if (score === 0) return;
  const entry = {
    name: playerName,
    score,
    round,
    lines: totalLines
  };

  try {
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderScores(data.scores || []);
    personalBest = data.personalBest;
    rankNotice.textContent = '랭킹 등록 완료!';
  } catch {
    renderScores(setLocalScore(entry));
    personalBest = Math.max(personalBest ?? 0, score);
    rankNotice.textContent = '로컬 랭킹에 저장되었습니다.';
  }
}

async function confirmPlayerName() {
  const value = playerNameInput.value.trim().replace(/[<>]/g, '').slice(0, 12);
  if (!value) {
    nameError.textContent = '닉네임을 입력해 주세요.';
    playerNameInput.focus();
    return;
  }
  playerName = value;
  playerNameInput.value = value;
  initAudio();
  await loadPersonalBest();
  startScreen.classList.add('hidden');
  resetGame();
}

// --- 14. 키보드 & DAS 컨트롤러 ---
const keys = {};
let dasTimer = null;
let dasInterval = null;

document.addEventListener('keydown', e => {
  initAudio();
  const k = e.key.toLowerCase();

  if (!startScreen.classList.contains('hidden')) {
    if (e.key === 'Enter') confirmPlayerName();
    return;
  }

  if (!resultScreen.classList.contains('hidden')) {
    return;
  }

  if (e.code === 'Space') {
    e.preventDefault();
    hardDrop();
    return;
  }

  if (['arrowleft', 'a'].includes(k)) {
    e.preventDefault();
    if (!keys['left']) {
      keys['left'] = true;
      moveLeft();
      clearTimeout(dasTimer);
      clearInterval(dasInterval);
      dasTimer = setTimeout(() => {
        dasInterval = setInterval(() => { if (keys['left']) moveLeft(); }, 40);
      }, 160);
    }
  }

  if (['arrowright', 'd'].includes(k)) {
    e.preventDefault();
    if (!keys['right']) {
      keys['right'] = true;
      moveRight();
      clearTimeout(dasTimer);
      clearInterval(dasInterval);
      dasTimer = setTimeout(() => {
        dasInterval = setInterval(() => { if (keys['right']) moveRight(); }, 40);
      }, 160);
    }
  }

  if (['arrowdown', 's'].includes(k)) {
    e.preventDefault();
    softDrop();
  }

  if (['arrowup', 'w', 'x'].includes(k)) {
    e.preventDefault();
    rotatePiece(1);
  }

  if (['z', 'control'].includes(k)) {
    e.preventDefault();
    rotatePiece(-1);
  }

  if (['c', 'shift'].includes(k)) {
    e.preventDefault();
    hold();
  }

  if (['p', 'escape'].includes(k)) {
    e.preventDefault();
    togglePause();
  }
});

document.addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  if (['arrowleft', 'a'].includes(k)) {
    keys['left'] = false;
    clearTimeout(dasTimer);
    clearInterval(dasInterval);
  }
  if (['arrowright', 'd'].includes(k)) {
    keys['right'] = false;
    clearTimeout(dasTimer);
    clearInterval(dasInterval);
  }
});

// 온스크린 모바일 터치 이벤트
btnMvLeft.addEventListener('pointerdown', e => { e.preventDefault(); initAudio(); moveLeft(); });
btnMvRight.addEventListener('pointerdown', e => { e.preventDefault(); initAudio(); moveRight(); });
btnSoftDrop.addEventListener('pointerdown', e => { e.preventDefault(); initAudio(); softDrop(); });
btnRotCw.addEventListener('pointerdown', e => { e.preventDefault(); initAudio(); rotatePiece(1); });
btnHardDrop.addEventListener('pointerdown', e => { e.preventDefault(); initAudio(); hardDrop(); });
btnHold.addEventListener('pointerdown', e => { e.preventDefault(); initAudio(); hold(); });

// 버튼 이벤트
startGameBtn.addEventListener('click', confirmPlayerName);
restartBtn.addEventListener('click', () => { initAudio(); resetGame(); });
pauseBtn.addEventListener('click', togglePause);

// 오디오 토글 버튼 이벤트
bgmToggleBtn.addEventListener('click', () => {
  initAudio();
  if (isMutedAll) isMutedAll = false;
  bgmEnabled = !bgmEnabled;
  if (bgmEnabled && isRunning && !isPaused) {
    playBGM();
  } else {
    pauseBGM();
  }
  updateAudioButtons();
});

sfxToggleBtn.addEventListener('click', () => {
  initAudio();
  if (isMutedAll) isMutedAll = false;
  sfxEnabled = !sfxEnabled;
  updateAudioButtons();
});

muteAllBtn.addEventListener('click', () => {
  initAudio();
  isMutedAll = !isMutedAll;
  if (isMutedAll) {
    pauseBGM();
  } else {
    if (bgmEnabled && isRunning && !isPaused) playBGM();
  }
  updateAudioButtons();
});

saveScoreBtn.addEventListener('click', async () => {
  saveScoreBtn.disabled = true;
  skipScoreBtn.disabled = true;
  await submitScore();
  resultScreen.classList.add('hidden');
  resetGame();
  saveScoreBtn.disabled = false;
  skipScoreBtn.disabled = false;
});

skipScoreBtn.addEventListener('click', () => {
  resultScreen.classList.add('hidden');
  statusMessage.textContent = '이번 점수는 등록되지 않았습니다.';
  resetGame();
});

// --- 15. 초기화 ---
updateAudioButtons();
loadScores();
render();
