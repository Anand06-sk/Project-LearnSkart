import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    getDocs,
    where,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

/* ========================================
   LEARNSKART DAILY PATH PUZZLE - CORE LOGIC
   Rebuilt swipe system, validation, and leaderboard
   ======================================== */

// Custom loop pattern applied (do not modify logic)
// Updated pattern + optimized line rendering (no logic changes)
const LETTER_LAYOUTS = [
    [0, 35, 25, 10, 14, 20, 3, 7, 28, 5],
];

const CONFIG = {
    GRID_SIZE: 6,
    WORD: 'LEARNSKART',
    LETTER_PATH_INDICES: [],
    HINT_TIME_PENALTY: 5,
    LEADERBOARD_LIMIT: 20,
    MAX_TIME_SECONDS: 900,
    MAX_SUBMISSIONS_PER_DAY: 2,
    MAX_ATTEMPTS_PER_DAY: 2,
};

const {
    indices: ACTIVE_LETTER_INDICES,
    layoutIndex: ACTIVE_LAYOUT_INDEX,
} = getDailyLetterLayout();

CONFIG.LETTER_PATH_INDICES = ACTIVE_LETTER_INDICES;
CONFIG.ACTIVE_LAYOUT_INDEX = ACTIVE_LAYOUT_INDEX;

function getDailyLetterLayout() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const millisPerDay = 24 * 60 * 60 * 1000;
    const daySeed = Math.floor(today.getTime() / millisPerDay);
    const layoutIndex = daySeed % LETTER_LAYOUTS.length;
    const layout = LETTER_LAYOUTS[layoutIndex] || LETTER_LAYOUTS[0];
    return {
        indices: [...layout],
        layoutIndex,
    };
}

CONFIG.TOTAL_TILES = CONFIG.GRID_SIZE * CONFIG.GRID_SIZE;

const SOLUTION_PATH = buildSerpentinePath(CONFIG.GRID_SIZE);
const LETTER_COORDS = CONFIG.LETTER_PATH_INDICES.map(index => SOLUTION_PATH[index]);
const LETTER_COORD_KEY_LOOKUP = new Map(
    LETTER_COORDS.map((coord, idx) => [coordKey(coord.row, coord.col), idx])
);
const HINT_PATH_SEQUENCE = [
    { row: 0, col: 0 },
    { row: 1, col: 0 },
    { row: 2, col: 0 },
    { row: 3, col: 0 },
    { row: 4, col: 0 },
    { row: 5, col: 0 },
    { row: 5, col: 1 },
    { row: 4, col: 1 },
    { row: 3, col: 1 },
    { row: 2, col: 1 },
    { row: 1, col: 1 },
    { row: 0, col: 1 },
    { row: 0, col: 2 },
    { row: 1, col: 2 },
    { row: 2, col: 2 },
    { row: 3, col: 2 },
    { row: 4, col: 2 },
    { row: 5, col: 2 },
    { row: 5, col: 3 },
    { row: 4, col: 3 },
    { row: 3, col: 3 },
    { row: 2, col: 3 },
    { row: 1, col: 3 },
    { row: 0, col: 3 },
    { row: 0, col: 4 },
    { row: 1, col: 4 },
    { row: 2, col: 4 },
    { row: 3, col: 4 },
    { row: 4, col: 4 },
    { row: 5, col: 4 },
    { row: 5, col: 5 },
    { row: 4, col: 5 },
    { row: 3, col: 5 },
    { row: 2, col: 5 },
    { row: 1, col: 5 },
    { row: 0, col: 5 },
];
const GRID_TEMPLATE = buildGridTemplate();

const state = {
    grid: [],
    tilesFlat: [],
    tileMatrix: [],
    path: [],
    visitedKeys: new Set(),
    mouseDown: false,
    touchActive: false,
    timerInterval: null,
    elapsedSeconds: 0,
    timerStarted: false,
    completed: false,
    wrapperEl: null,
    wrapperRect: null,
    canvas: null,
    ctx: null,
    isAnimatingPath: false,
    hintOverlayTimeout: null,
    hintAnimationToken: 0,
    hintAcknowledged: false,
    attemptRecorded: false,
    attemptsLocked: false,
    tileCenters: [],
    drawQueued: false,
    moveQueueTile: null,
    moveQueueRaf: null,
};

let popperCleanupTimeout = null;

// Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyBhOM6na9p_tZchRti_PEkG-MxNd43m7Wc',
    authDomain: 'learnskart-game.firebaseapp.com',
    projectId: 'learnskart-game',
    storageBucket: 'learnskart-game.firebasestorage.app',
    messagingSenderId: '690958180248',
    appId: '1:690958180248:web:4f30e6776b2bb1616dd5ed',
    measurementId: 'G-DCD3T80YTX',
};

let firebaseApp = null;
let db = null;

try {
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
    console.log('Firebase ready');
} catch (error) {
    console.error('Firebase init failed:', error);
}

// ========================================
// GRID & PATH GENERATION
// ========================================

function buildSerpentinePath(size) {
    const coords = [];
    for (let row = 0; row < size; row++) {
        if (row % 2 === 0) {
            for (let col = 0; col < size; col++) {
                coords.push({ row, col });
            }
        } else {
            for (let col = size - 1; col >= 0; col--) {
                coords.push({ row, col });
            }
        }
    }
    return coords;
}

function buildGridTemplate() {
    const grid = Array.from({ length: CONFIG.GRID_SIZE }, () =>
        Array(CONFIG.GRID_SIZE).fill('')
    );

    CONFIG.LETTER_PATH_INDICES.forEach((pathIndex, letterIdx) => {
        const coord = SOLUTION_PATH[pathIndex];
        grid[coord.row][coord.col] = CONFIG.WORD[letterIdx];
    });

    return grid;
}

function cloneGridTemplate() {
    return GRID_TEMPLATE.map(row => [...row]);
}

function coordKey(row, col) {
    return `${row}-${col}`;
}

const DIRECTIONS = [
    { row: 1, col: 0 },
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: -1 },
];

// ========================================
// TIMER & STREAK UTILITIES
// ========================================

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function startTimer() {
    if (state.timerStarted) return;
    if (!ensureAttemptAvailability()) return;
    state.timerStarted = true;
    state.timerInterval = setInterval(() => {
        state.elapsedSeconds += 1;
        if (state.elapsedSeconds >= CONFIG.MAX_TIME_SECONDS) {
            stopTimer();
            showToast('Time limit reached. Try again!');
            resetGame();
            return;
        }
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    state.timerStarted = false;
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}

function resetTimer() {
    stopTimer();
    state.elapsedSeconds = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    document.getElementById('timer').textContent = formatTime(state.elapsedSeconds);
}
 
function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const date = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
}

function normalizeStoredDate(value) {
    if (!value) return null;
    return value.includes('_') ? value.replace(/_/g, '-') : value;
}

function getStreak() {
    const raw = localStorage.getItem('dailyPathStreak');
    if (!raw) return { count: 0, lastPlayDate: null };
    try {
        const parsed = JSON.parse(raw);
        parsed.lastPlayDate = normalizeStoredDate(parsed.lastPlayDate);
        return parsed;
    } catch (error) {
        return { count: 0, lastPlayDate: null };
    }
}

function updateStreak(newCount) {
    localStorage.setItem('dailyPathStreak', JSON.stringify({
        count: newCount,
        lastPlayDate: getTodayDateString(),
    }));
    document.getElementById('streakCount').textContent = newCount;
}

function refreshStreakUI() {
    document.getElementById('streakCount').textContent = getStreak().count;
}

function applyCompletionStreak() {
    const today = getTodayDateString();
    const current = getStreak();
    if (!current.lastPlayDate) {
        updateStreak(1);
        return;
    }

    if (current.lastPlayDate === today) {
        updateStreak(current.count);
        return;
    }

    const lastDate = new Date(normalizeStoredDate(current.lastPlayDate));
    const todayDate = new Date(today);
    const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        updateStreak(current.count + 1);
    } else {
        updateStreak(1);
    }
}

// ========================================
// ATTEMPT LIMIT MANAGEMENT
// ========================================

const ATTEMPT_STORAGE_KEY = 'dailyPathAttemptInfo';

function getAttemptInfo() {
    const today = getTodayDateString();
    const raw = localStorage.getItem(ATTEMPT_STORAGE_KEY);
    if (!raw) {
        return { date: today, attempts: 0 };
    }
    try {
        const parsed = JSON.parse(raw);
        parsed.date = normalizeStoredDate(parsed.date) || today;
        if (!parsed.attempts && parsed.attempts !== 0) {
            parsed.attempts = 0;
        }
        return parsed;
    } catch (error) {
        return { date: today, attempts: 0 };
    }
}

function saveAttemptInfo(info) {
    localStorage.setItem(ATTEMPT_STORAGE_KEY, JSON.stringify(info));
}

function ensureAttemptInfoFresh() {
    const today = getTodayDateString();
    const info = getAttemptInfo();
    if (info.date !== today) {
        const fresh = { date: today, attempts: 0 };
        saveAttemptInfo(fresh);
        return fresh;
    }
    return info;
}

function canStartAttempt() {
    const info = ensureAttemptInfoFresh();
    return info.attempts < CONFIG.MAX_ATTEMPTS_PER_DAY;
}

function recordAttemptStart() {
    const info = ensureAttemptInfoFresh();
    info.attempts += 1;
    saveAttemptInfo(info);
}

function lockGameForAttempts() {
    state.attemptsLocked = true;
    state.mouseDown = false;
    state.touchActive = false;
    stopTimer();
    document.body.classList.add('attempt-locked');
    const overlay = document.getElementById('attemptLimitOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

function unlockGameFromAttempts() {
    state.attemptsLocked = false;
    document.body.classList.remove('attempt-locked');
    const overlay = document.getElementById('attemptLimitOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function ensureAttemptAvailability() {
    if (state.attemptsLocked) {
        showToast('Daily attempt limit reached. Come back tomorrow.');
        return false;
    }
    if (!canStartAttempt()) {
        lockGameForAttempts();
        showToast('Daily attempt limit reached. Come back tomorrow.');
        return false;
    }
    return true;
}

// ========================================
// GRID RENDERING & INTERACTION
// ========================================

function initializeGame() {
    state.grid = cloneGridTemplate();
    state.tilesFlat = [];
    state.tileMatrix = Array.from({ length: CONFIG.GRID_SIZE }, () => Array(CONFIG.GRID_SIZE).fill(null));
    state.path = [];
    state.visitedKeys = new Set();
    state.completed = false;
    state.isAnimatingPath = false;
    state.hintOverlayTimeout = null;
    state.attemptRecorded = false;
    resetTimer();
    hideWordCompleteHint();
    clearToast();
    setupGridTiles();
    setupCanvas();
    updateTimerDisplay();
    refreshStreakUI();
    ensureAttemptInfoFresh();
    if (canStartAttempt()) {
        unlockGameFromAttempts();
    } else {
        lockGameForAttempts();
    }
}

function setupGridTiles() {
    const gridEl = document.getElementById('gameGrid');
    gridEl.innerHTML = '';

    for (let row = 0; row < CONFIG.GRID_SIZE; row++) {
        for (let col = 0; col < CONFIG.GRID_SIZE; col++) {
            const tile = document.createElement('div');
            tile.classList.add('grid-tile');
            tile.dataset.row = String(row);
            tile.dataset.col = String(col);

            const letter = state.grid[row][col];
            if (letter) {
                tile.textContent = letter;
                tile.classList.add('letter');
            } else {
                tile.classList.add('empty');
            }

            tile.addEventListener('touchstart', handleTouchStart, { passive: false });
            tile.addEventListener('touchmove', handleTouchMove, { passive: false });
            tile.addEventListener('touchend', handleTouchEnd);
            tile.addEventListener('touchcancel', handleTouchEnd);

            tile.addEventListener('mousedown', handleMouseDown);
            tile.addEventListener('mousemove', handleMouseMove);
            tile.addEventListener('mouseup', handleMouseUp);
            tile.addEventListener('mouseleave', handleMouseUp);

            gridEl.appendChild(tile);
            state.tilesFlat.push(tile);
            state.tileMatrix[row][col] = tile;
        }
    }
}

function setupCanvas() {
    state.wrapperEl = document.querySelector('.grid-wrapper');
    state.canvas = document.getElementById('pathCanvas');
    state.ctx = state.canvas.getContext('2d');
    syncCanvasSize();
}

function syncCanvasSize() {
    if (!state.wrapperEl || !state.canvas) return;
    state.wrapperRect = state.wrapperEl.getBoundingClientRect();
    state.canvas.width = state.wrapperRect.width;
    state.canvas.height = state.wrapperRect.height;
    updateTileCenters();
    if (!state.isAnimatingPath) {
        requestDrawLivePath();
    }
}

function updateTileCenters() {
    if (!state.wrapperEl || !state.tileMatrix.length) return;
    const wrapperRect = state.wrapperRect || state.wrapperEl.getBoundingClientRect();
    state.tileCenters = state.tileMatrix.map(row =>
        row.map(tile => {
            if (!tile) return null;
            const rect = tile.getBoundingClientRect();
            return {
                x: rect.left - wrapperRect.left + rect.width / 2,
                y: rect.top - wrapperRect.top + rect.height / 2,
            };
        })
    );
}

function requestDrawLivePath() {
    if (state.drawQueued) return;
    state.drawQueued = true;
    requestAnimationFrame(() => {
        state.drawQueued = false;
        drawLivePath();
    });
}

function handleTouchStart(event) {
    if (state.completed) return;
    event.preventDefault();
    state.touchActive = true;
    processTile(event.currentTarget);
}

function handleTouchMove(event) {
    if (!state.touchActive || state.completed) return;
    event.preventDefault();
    const touch = event.touches[0];
    if (!touch) return;
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.classList.contains('grid-tile')) {
        queueMoveTile(element);
    }
}

function handleTouchEnd() {
    state.touchActive = false;
}

function handleMouseDown(event) {
    if (state.completed) return;
    event.preventDefault();
    state.mouseDown = true;
    processTile(event.currentTarget);
}

function handleMouseMove(event) {
    if (!state.mouseDown || state.completed) return;
    const element = document.elementFromPoint(event.clientX, event.clientY);
    if (element && element.classList.contains('grid-tile')) {
        queueMoveTile(element);
    }
}

function handleMouseUp() {
    state.mouseDown = false;
}

function queueMoveTile(tile) {
    state.moveQueueTile = tile;
    if (state.moveQueueRaf) return;
    state.moveQueueRaf = requestAnimationFrame(() => {
        state.moveQueueRaf = null;
        const nextTile = state.moveQueueTile;
        state.moveQueueTile = null;
        if (nextTile) {
            processTile(nextTile);
        }
    });
}

function processTile(tile) {
    if (state.attemptsLocked) return;
    const row = Number(tile.dataset.row);
    const col = Number(tile.dataset.col);

    if (state.path.length === 0) {
        if (state.grid[row][col] !== CONFIG.WORD[0]) {
            return;
        }
        addTileToPath(row, col, tile);
        startTimer();
        return;
    }

    const last = state.path[state.path.length - 1];
    if (last.row === row && last.col === col) {
        return;
    }

    if (!areAdjacent(last, { row, col })) {
        return;
    }

    const existingIndex = state.path.findIndex(step => step.row === row && step.col === col);
    if (existingIndex !== -1) {
        trimPath(existingIndex + 1);
        return;
    }

    addTileToPath(row, col, tile);
}

function addTileToPath(row, col, tile) {
    const key = coordKey(row, col);
    state.path.push({ row, col, element: tile });
    state.visitedKeys.add(key);
    updateTileClasses();
    requestDrawLivePath();
    evaluateProgress();
}

function trimPath(targetLength) {
    while (state.path.length > targetLength) {
        const removed = state.path.pop();
        const key = coordKey(removed.row, removed.col);
        state.visitedKeys.delete(key);
        removed.element.classList.remove('visited', 'current');
    }
    updateTileClasses();
    requestDrawLivePath();
    evaluateProgress();
}

function updateTileClasses() {
    state.tilesFlat.forEach(tile => {
        tile.classList.remove('visited', 'current', 'path-start', 'path-end');
    });

    state.path.forEach((step, index) => {
        step.element.classList.add('visited');
        if (index === 0) {
            step.element.classList.add('path-start');
        }
        if (index === state.path.length - 1) {
            step.element.classList.add('current');
        }
    });

    if (state.path.length > 0) {
        state.path[state.path.length - 1].element.classList.add('path-end');
    }
}

function drawLivePath() {
    if (!state.ctx || state.isAnimatingPath) return;
    const ctx = state.ctx;
    ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);

    if (state.path.length === 0) return;
    const points = state.path.map(({ row, col }) => getTileCenter(row, col));

    if (points.length === 1) {
        drawPathDots(points, ctx);
        return;
    }

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(37, 99, 235, 0.45)';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    ctx.shadowBlur = 0;
    drawPathDots(points, ctx);
}

function drawPathDots(points, ctx) {
    ctx.fillStyle = '#1e3a8a';
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

function getTileCenter(row, col) {
    const cached = state.tileCenters?.[row]?.[col];
    if (cached) return cached;
    const tile = state.tileMatrix[row][col];
    if (!tile) return { x: 0, y: 0 };
    const tileRect = tile.getBoundingClientRect();
    const wrapperRect = state.wrapperRect || state.wrapperEl.getBoundingClientRect();
    return {
        x: tileRect.left - wrapperRect.left + tileRect.width / 2,
        y: tileRect.top - wrapperRect.top + tileRect.height / 2,
    };
}

function areAdjacent(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

function findGridPath(start, target) {
    if (!start || !target) return null;
    const startKey = coordKey(start.row, start.col);
    const targetKey = coordKey(target.row, target.col);
    if (startKey === targetKey) {
        return [{ row: start.row, col: start.col }];
    }

    const queue = [{ row: start.row, col: start.col }];
    const parents = new Map();
    const visited = new Set([startKey]);

    while (queue.length) {
        const current = queue.shift();
        for (const dir of DIRECTIONS) {
            const nr = current.row + dir.row;
            const nc = current.col + dir.col;
            if (nr < 0 || nr >= CONFIG.GRID_SIZE || nc < 0 || nc >= CONFIG.GRID_SIZE) {
                continue;
            }
            const key = coordKey(nr, nc);
            if (visited.has(key)) continue;
            visited.add(key);
            parents.set(key, coordKey(current.row, current.col));
            if (key === targetKey) {
                return reconstructPath(parents, startKey, targetKey);
            }
            queue.push({ row: nr, col: nc });
        }
    }

    return null;
}

function reconstructPath(parents, startKey, endKey) {
    const path = [];
    let currentKey = endKey;
    while (currentKey) {
        const [row, col] = currentKey.split('-').map(Number);
        path.push({ row, col });
        if (currentKey === startKey) break;
        currentKey = parents.get(currentKey);
        if (!currentKey) break;
    }
    return path.reverse();
}

// ========================================
// PROGRESS & VALIDATION
// ========================================

function evaluateProgress() {
    const formedWord = buildWordFromPath();
    const wordComplete = formedWord === CONFIG.WORD;
    const coveredAll = state.path.length === CONFIG.TOTAL_TILES;

    if (wordComplete && !coveredAll) {
        showWordCompleteHint();
    } else {
        hideWordCompleteHint();
    }

    if (wordComplete && coveredAll) {
        handleCompletion();
    }
}

function buildWordFromPath() {
    let result = '';
    state.path.forEach(step => {
        const letter = state.grid[step.row][step.col];
        if (letter) {
            result += letter;
        }
    });
    return result;
}

function showWordCompleteHint() {
    document.getElementById('wordCompleteHint').style.display = 'block';
}

function hideWordCompleteHint() {
    document.getElementById('wordCompleteHint').style.display = 'none';
}

function handleCompletion() {
    if (state.completed) return;
    state.completed = true;
    state.mouseDown = false;
    state.touchActive = false;
    stopTimer();
    cancelHintOverlayAnimation();
    applyCompletionStreak();
    animateCompletionPath().then(() => {
        showCompletionModal();
    });
}

function animateCompletionPath() {
    return new Promise(resolve => {
        if (!state.ctx || state.path.length < 2) {
            resolve();
            return;
        }

        state.isAnimatingPath = true;
        state.wrapperEl.classList.add('path-celebrate');
        const ctx = state.ctx;
        const points = state.path.map(({ row, col }) => getTileCenter(row, col));
        let segmentIndex = 0;
        let segmentProgress = 0;
        const segmentDuration = 90;
        let lastTimestamp = null;

        function step(timestamp) {
            if (!lastTimestamp) {
                lastTimestamp = timestamp;
            }
            const delta = timestamp - lastTimestamp;
            lastTimestamp = timestamp;
            segmentProgress += delta / segmentDuration;

            if (segmentProgress > 1) {
                segmentProgress = 0;
                segmentIndex += 1;
            }

            ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
            ctx.strokeStyle = 'rgba(96, 165, 250, 0.95)';
            ctx.lineWidth = 6;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.shadowColor = 'rgba(96, 165, 250, 0.9)';
            ctx.shadowBlur = 18;

            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i <= segmentIndex && i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }

            if (segmentIndex < points.length - 1) {
                const from = points[segmentIndex];
                const to = points[segmentIndex + 1];
                const x = from.x + (to.x - from.x) * segmentProgress;
                const y = from.y + (to.y - from.y) * segmentProgress;
                ctx.lineTo(x, y);
            }

            ctx.stroke();
            drawPathDots(points.slice(0, segmentIndex + 1), ctx);

            if (segmentIndex >= points.length - 1) {
                ctx.shadowBlur = 25;
                ctx.strokeStyle = 'rgba(59, 130, 246, 0.9)';
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                ctx.stroke();
                setTimeout(() => {
                    state.isAnimatingPath = false;
                    state.wrapperEl.classList.remove('path-celebrate');
                    drawLivePath();
                    resolve();
                }, 600);
                return;
            }

            requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    });
}

// ========================================
// HINT SYSTEM
// ========================================

function handleHintRequest() {
    if (state.completed) return;
    if (!state.hintAcknowledged) {
        document.getElementById('hintModal').style.display = 'block';
        return;
    }
    applyHint();
}

function confirmHintUsage() {
    document.getElementById('hintModal').style.display = 'none';
    state.hintAcknowledged = true;
    applyHint();
}

function cancelHintUsage() {
    document.getElementById('hintModal').style.display = 'none';
}

function applyHint() {
    if (!state.path.length) {
        showToast('Start from L to use a hint.');
        return;
    }

    state.elapsedSeconds += CONFIG.HINT_TIME_PENALTY;
    updateTimerDisplay();

    const progress = getLetterProgress();
    if (progress >= CONFIG.WORD.length) {
        showToast('The word is already complete!');
        return;
    }

    const lastStep = state.path[state.path.length - 1];
    const currentIndex = HINT_PATH_SEQUENCE.findIndex(step => step.row === lastStep.row && step.col === lastStep.col);

    if (currentIndex === -1) {
        showToast('Hint unavailable from the current path.');
        return;
    }

    if (currentIndex >= HINT_PATH_SEQUENCE.length - 1) {
        showToast('The word is already complete!');
        return;
    }

    const sequence = HINT_PATH_SEQUENCE.slice(currentIndex, currentIndex + 2);
    cancelHintOverlayAnimation();
    drawHintOverlay(sequence);
}

function getLetterProgress() {
    let progress = 0;
    for (const step of state.path) {
        const letter = state.grid[step.row][step.col];
        if (letter === CONFIG.WORD[progress]) {
            progress += 1;
            if (progress === CONFIG.WORD.length) break;
        }
    }
    return progress;
}

async function drawHintOverlay(sequence) {
    if (!state.ctx || !sequence || sequence.length < 2) return;
    const animationToken = ++state.hintAnimationToken;
    const ctx = state.ctx;
    const startPoint = getTileCenter(sequence[0].row, sequence[0].col);
    const endPoint = getTileCenter(sequence[1].row, sequence[1].col);
    const duration = 450;
    const startTime = performance.now();

    function frame(now) {
        if (animationToken !== state.hintAnimationToken) return;

        const progress = Math.min((now - startTime) / duration, 1);
        const x = startPoint.x + (endPoint.x - startPoint.x) * progress;
        const y = startPoint.y + (endPoint.y - startPoint.y) * progress;

        drawLivePath();

        ctx.save();
        ctx.strokeStyle = 'rgba(129, 212, 250, 0.95)';
        ctx.lineWidth = 6;
        ctx.setLineDash([10, 10]);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(129, 212, 250, 0.98)';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        if (progress < 1) {
            requestAnimationFrame(frame);
            return;
        }

        state.hintOverlayTimeout = setTimeout(() => {
            drawLivePath();
            state.hintOverlayTimeout = null;
        }, 2000);
    }

    requestAnimationFrame(frame);
}

function clearHintOverlay() {
    if (state.hintOverlayTimeout) {
        clearTimeout(state.hintOverlayTimeout);
        state.hintOverlayTimeout = null;
    }
    requestDrawLivePath();
}

function cancelHintOverlayAnimation() {
    state.hintAnimationToken += 1;
    if (state.hintOverlayTimeout) {
        clearTimeout(state.hintOverlayTimeout);
        state.hintOverlayTimeout = null;
    }
    requestDrawLivePath();
}

// ========================================
// TOASTS
// ========================================

let toastTimeout = null;
function showToast(message) {
    const toast = document.getElementById('errorToast');
    const messageEl = document.getElementById('toastMessage');
    if (!toast || !messageEl) return;
    messageEl.textContent = message;
    toast.style.display = 'block';
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.style.display = 'none';
    }, 2500);
}

function clearToast() {
    const toast = document.getElementById('errorToast');
    if (toast) {
        toast.style.display = 'none';
    }
    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toastTimeout = null;
    }
}

// ========================================
// NAVIGATION & GLOBAL UI
// ========================================

function openMenu() {
    document.body.classList.add('menu-open');
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.setAttribute('aria-hidden', 'false');
    const backdrop = document.getElementById('menuBackdrop');
    if (backdrop) backdrop.style.display = 'block';
}

function closeMenu() {
    document.body.classList.remove('menu-open');
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.setAttribute('aria-hidden', 'true');
    const backdrop = document.getElementById('menuBackdrop');
    if (backdrop) backdrop.style.display = 'none';
}

function toggleMenu() {
    if (document.body.classList.contains('menu-open')) {
        closeMenu();
    } else {
        openMenu();
    }
}

function openLeaderboardOverlay(options = {}) {
    const { refresh = true } = options;
    const overlay = document.getElementById('leaderboardOverlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    document.body.classList.add('leaderboard-open');
    if (refresh) {
        loadLeaderboard({ containerId: 'globalLeaderboard', sectionId: null });
    }
}

function closeLeaderboardOverlay() {
    const overlay = document.getElementById('leaderboardOverlay');
    if (!overlay) return;
    overlay.style.display = 'none';
    document.body.classList.remove('leaderboard-open');
}

// ========================================
// LEADERBOARD (FIREBASE)
// ========================================

async function saveScore(name, time) {
    if (!db) {
        console.error('saveScore error: Firebase not initialized');
        return false;
    }
    try {
        await addDoc(collection(db, 'leaderboard'), {
            name,
            time,
            timestamp: Date.now(),
            date: getTodayDateString(),
        });
        console.log('Score saved successfully:', { name, time, date: getTodayDateString() });
        return true;
    } catch (error) {
        console.error('saveScore error:', error.code, error.message, error);
        if (error.code === 'permission-denied') {
            console.warn('Firebase permission denied. Check security rules.');
        }
        return false;
    }
}

async function getScoresForToday(limitCount = null) {
    if (!db) {
        console.error('getScoresForToday error: Firebase not initialized');
        return [];
    }
    try {
        const todayStr = getTodayDateString();
        const constraints = [
            where('date', '==', todayStr),
            orderBy('time', 'asc'),
        ];
        if (limitCount) {
            constraints.push(limit(limitCount));
        }
        const snapshot = await getDocs(query(collection(db, 'leaderboard'), ...constraints));
        const results = [];
        snapshot.forEach(doc => results.push(doc.data()));
        console.log(`getScoresForToday success: Found ${results.length} scores for ${todayStr}`);
        return results;
    } catch (error) {
        console.error('getScoresForToday error:', error.code, error.message, error);
        if (error.code === 'failed-precondition') {
            console.warn('Query requires composite index. Check Firebase console.');
        } else if (error.code === 'permission-denied') {
            console.warn('Firebase permission denied. Check security rules.');
        }
        return [];
    }
}

async function getTopScores() {
    return getScoresForToday(CONFIG.LEADERBOARD_LIMIT);
}

async function estimatePlayerRank(timeSeconds, includePendingEntry = false) {
    const scores = await getScoresForToday();
    if (!scores.length && !includePendingEntry) {
        return { position: 1, total: includePendingEntry ? 1 : 0 };
    }
    const faster = scores.filter(score => score.time < timeSeconds).length;
    const position = faster + 1;
    const total = includePendingEntry ? scores.length + 1 : scores.length;
    return { position, total };
}

function getRankEmoji(position) {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return null;
}

function getStreakEmoji() {
    return '🔥';
}

async function loadLeaderboard(options = {}) {
    const {
        containerId = 'leaderboard',
        sectionId = 'leaderboardSection',
    } = options;

    const leaderboardDiv = document.getElementById(containerId);
    if (!leaderboardDiv) return;
    leaderboardDiv.innerHTML = '<div class="loading">Loading leaderboard...</div>';

    try {
        const scores = await getTopScores();
        leaderboardDiv.innerHTML = '';
        const highlightName = (localStorage.getItem('dailyPathLastName') || '').trim().toLowerCase();

        if (!scores.length) {
            leaderboardDiv.innerHTML = '<div class="no-scores">No scores yet. Be the first!</div>';
            if (sectionId) {
                const section = document.getElementById(sectionId);
                if (section) section.style.display = 'block';
            }
            return;
        }

        scores.forEach((score, index) => {
            const position = index + 1;
            const entry = document.createElement('div');
            entry.className = 'leaderboard-entry';
            
            const rankEmoji = getRankEmoji(position);
            const rankDisplay = rankEmoji 
                ? `<span class="rank-emoji animated-emoji">${rankEmoji}</span>`
                : `<span class="rank">#${position}</span>`;
            
            entry.innerHTML = `
                ${rankDisplay}
                <span class="name">${htmlEscape(score.name)}</span>
                <span class="time">${formatTime(score.time)}</span>
            `;
            
            if (highlightName && score.name && score.name.trim().toLowerCase() === highlightName) {
                entry.classList.add('current-user');
            }
            
            if (position <= 3) {
                entry.classList.add(`rank-${position}`);
            }
            
            leaderboardDiv.appendChild(entry);
        });

        if (sectionId) {
            const section = document.getElementById(sectionId);
            if (section) section.style.display = 'block';
        }
    } catch (error) {
        console.error('loadLeaderboard error:', error);
        leaderboardDiv.innerHTML = '<div class="error-message">Failed to load leaderboard. Please try again.</div>';
        if (sectionId) {
            const section = document.getElementById(sectionId);
            if (section) section.style.display = 'block';
        }
    }
}

function htmlEscape(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function refreshAllLeaderboards() {
    try {
        await Promise.all([
            loadLeaderboard().catch(e => console.error('refreshAllLeaderboards: loadLeaderboard failed', e)),
            loadLeaderboard({ containerId: 'globalLeaderboard', sectionId: null }).catch(e => console.error('refreshAllLeaderboards: globalLeaderboard failed', e)),
        ]);
    } catch (error) {
        console.error('refreshAllLeaderboards error:', error);
    }
}

async function updateRankBanner(includePendingEntry = false) {
    const rankBlock = document.getElementById('yourRank');
    if (!rankBlock) return;
    try {
        const rank = await estimatePlayerRank(state.elapsedSeconds, includePendingEntry);
        if (!rank) {
            rankBlock.style.display = 'none';
            return;
        }

        rankBlock.style.display = 'block';
        if (rank.position > CONFIG.LEADERBOARD_LIMIT) {
            rankBlock.textContent = `You are at position ${rank.position} today. Try tomorrow!`;
        } else {
            rankBlock.textContent = `Current rank: #${rank.position} out of ${Math.max(rank.total, rank.position)} players.`;
        }
    } catch (error) {
        console.error('updateRankBanner error:', error);
        rankBlock.style.display = 'none';
    }
}

// ========================================
// TOP RANK CELEBRATION
// ========================================

function resetTopRankBanner() {
    const banner = document.getElementById('topRankCongrats');
    if (!banner) return;
    banner.style.display = 'none';
    banner.classList.remove('show', 'rank-1', 'rank-2', 'rank-3');
}

function clearTopRankPoppers() {
    const container = document.getElementById('confetti');
    if (container) {
        container.innerHTML = '';
    }
    if (popperCleanupTimeout) {
        clearTimeout(popperCleanupTimeout);
        popperCleanupTimeout = null;
    }
}

function launchTopRankPoppers(position) {
    const container = document.getElementById('confetti');
    if (!container) return;
    clearTopRankPoppers();
    const palette = {
        1: ['#fcd34d', '#fbbf24', '#fde68a'],
        2: ['#e2e8f0', '#94a3b8', '#cbd5f5'],
        3: ['#fdba74', '#fb923c', '#fecdd3'],
    };
    const colors = palette[position] || ['#60a5fa', '#34d399', '#f472b6'];
    const pieceCount = 56;
    for (let i = 0; i < pieceCount; i++) {
        const piece = document.createElement('span');
        piece.className = 'confetti-piece';
        piece.style.setProperty('--popper-color', colors[i % colors.length]);
        const side = i % 4;
        let top = '50%';
        let left = '50%';
        let travelX = `${(Math.random() - 0.5) * 220}px`;
        let travelY = `${(Math.random() - 0.5) * 220}px`;

        if (side === 0) {
            top = '0%';
            left = `${Math.random() * 100}%`;
            travelY = `${140 + Math.random() * 120}px`;
        } else if (side === 1) {
            top = `${Math.random() * 100}%`;
            left = '100%';
            travelX = `${-140 - Math.random() * 120}px`;
        } else if (side === 2) {
            top = '100%';
            left = `${Math.random() * 100}%`;
            travelY = `${-140 - Math.random() * 120}px`;
        } else {
            top = `${Math.random() * 100}%`;
            left = '0%';
            travelX = `${140 + Math.random() * 120}px`;
        }

        piece.style.top = top;
        piece.style.left = left;
        piece.style.setProperty('--travelX', travelX);
        piece.style.setProperty('--travelY', travelY);
        container.appendChild(piece);
    }

    popperCleanupTimeout = setTimeout(() => {
        clearTopRankPoppers();
    }, 2200);
}

async function checkAndCelebrateTopRank() {
    const banner = document.getElementById('topRankCongrats');
    const medal = document.getElementById('topRankMedal');
    const title = document.getElementById('topRankTitle');
    const subtitle = document.getElementById('topRankSubtitle');
    if (!banner || !medal || !title || !subtitle) return;
    resetTopRankBanner();

    try {
        const rank = await estimatePlayerRank(state.elapsedSeconds, true);
        if (!rank || rank.position > 3) {
            clearTopRankPoppers();
            return;
        }

        const position = rank.position;
        const titleMap = {
            1: 'Legendary Run!',
            2: 'Lightning Fast!',
            3: 'Podium Finish!',
        };

        banner.classList.add(`rank-${position}`);
        medal.textContent = `#${position}`;
        title.textContent = titleMap[position] || 'Amazing Speed!';
        subtitle.textContent = `You secured position #${position} today. Incredible work!`;
        banner.style.display = 'flex';
        requestAnimationFrame(() => {
            banner.classList.add('show');
        });
        launchTopRankPoppers(position);
    } catch (error) {
        console.error('checkAndCelebrateTopRank error:', error);
    }
}

// ========================================
// NAME VALIDATION & SUBMISSION
// ========================================

function validatePlayerName(name) {
    const trimmed = name.trim();
    if (trimmed.length < 3) {
        return { valid: false, error: 'Minimum 3 characters required.' };
    }
    if (trimmed.length > 60) {
        return { valid: false, error: 'Maximum 60 characters allowed.' };
    }
    if (!/^[a-zA-Z\s]+$/.test(trimmed)) {
        return { valid: false, error: 'Letters and spaces only. No numbers or symbols.' };
    }
    return { valid: true, error: '' };
}

function canSubmitScore() {
    const key = `dailyPathSubmissions_${getTodayDateString()}`;
    const count = Number(localStorage.getItem(key) || '0');
    return count < CONFIG.MAX_SUBMISSIONS_PER_DAY;
}

function recordSubmission() {
    const key = `dailyPathSubmissions_${getTodayDateString()}`;
    const count = Number(localStorage.getItem(key) || '0');
    localStorage.setItem(key, String(count + 1));
}

async function submitScore() {
    if (!state.completed) {
        showToast('Finish the puzzle to submit a score.');
        return;
    }

    if (!canSubmitScore()) {
        showToast('You have reached today\'s submission limit.');
        return;
    }

    const nameInput = document.getElementById('playerName');
    const validationEl = document.getElementById('nameValidation');
    const name = nameInput.value;
    const validation = validatePlayerName(name);

    if (!validation.valid) {
        nameInput.classList.add('error');
        validationEl.textContent = validation.error;
        validationEl.classList.add('error');
        return;
    }

    nameInput.classList.remove('error');
    validationEl.textContent = '';
    validationEl.classList.remove('error');

    const submitBtn = document.getElementById('submitScoreBtn');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    recordSubmission();
    const trimmedName = name.trim();

    try {
        const success = await saveScore(trimmedName, state.elapsedSeconds);

        if (success) {
            recordAttemptStart();
            showToast('Score submitted!');
            localStorage.setItem('dailyPathLastName', trimmedName);
            nameInput.value = '';
            await refreshAllLeaderboards();
            await updateRankBanner(true);
            const rankValue = await ensureCompletionRank();
            if (rankValue) {
                try {
                    await shareScore(trimmedName, state.elapsedSeconds, rankValue);
                } catch (error) {
                    console.error('shareScore error:', error);
                }
            }
            hideCompletionModal();
            openLeaderboardOverlay({ refresh: false });
        } else {
            showToast('Could not save score. Try again later.');
        }
    } catch (error) {
        console.error('submitScore error', error);
        showToast('Could not save score. Try again later.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
}

// ========================================
// COMPLETION MODAL
// ========================================

async function ensureCompletionRank() {
    const completionRankEl = document.getElementById('completionRank');
    if (!completionRankEl) return null;

    completionRankEl.textContent = '-';
    try {
        const rank = await estimatePlayerRank(state.elapsedSeconds, true);
        if (rank) {
            completionRankEl.textContent = `#${rank.position}`;
            return String(rank.position);
        }
    } catch (error) {
        console.error('ensureCompletionRank error:', error);
    }
    return null;
}

function getCompletionRankValue() {
    const completionRankEl = document.getElementById('completionRank');
    if (!completionRankEl) return '';
    const text = completionRankEl.textContent.trim();
    if (!text || text === '-') return '';
    return text.replace('#', '');
}

function shareScore(name, score, rank) {
    const text = `🔥 LearnSkart Daily Puzzle

👋 Hey, I'm ${name}!

⏱ I solved it in: ${score} seconds  
🏆 My Rank: #${rank}

😎 Think you can beat me?
🧠 Try now and prove it!

👉 https://learnskart.in/daily-puzzle/`;

    if (navigator.share) {
        return navigator.share({
            title: 'LearnSkart Puzzle Challenge',
            text: text,
        });
    }

    return navigator.clipboard.writeText(text).then(() => {
        alert('Copied! Share it with your friends 🔥');
    });
}

async function handleShareScore() {
    if (!state.completed) {
        showToast('Finish the puzzle to share your score.');
        return;
    }
    const nameInput = document.getElementById('playerName');
    const playerName = nameInput ? nameInput.value.trim() : '';
    if (!playerName) {
        showToast('Please enter your name before sharing.');
        return;
    }

    let rankValue = getCompletionRankValue();
    if (!rankValue) {
        rankValue = await ensureCompletionRank();
    }

    if (!rankValue) {
        showToast('Rank unavailable right now. Please try again.');
        return;
    }

    try {
        await shareScore(playerName, state.elapsedSeconds, rankValue);
    } catch (error) {
        console.error('shareScore error:', error);
        showToast('Share cancelled.');
    }
}

function showCompletionModal() {
    const modal = document.getElementById('completionModal');
    document.getElementById('completionTime').textContent = formatTime(state.elapsedSeconds);
    modal.style.display = 'block';
    const submissionLimitMessage = document.getElementById('submissionLimitMessage');
    const nameSection = document.getElementById('nameInputSection');
    const leaderboardSection = document.getElementById('leaderboardSection');
    leaderboardSection.style.display = 'none';

    if (canSubmitScore()) {
        submissionLimitMessage.style.display = 'none';
        nameSection.style.display = 'block';
    } else {
        submissionLimitMessage.style.display = 'block';
        nameSection.style.display = 'none';
    }

    loadLeaderboard();
    updateRankBanner(false);
    ensureCompletionRank();
    checkAndCelebrateTopRank();
}

function hideCompletionModal() {
    document.getElementById('completionModal').style.display = 'none';
    resetTopRankBanner();
    clearTopRankPoppers();
}

// ========================================
// RESET
// ========================================

function resetGame() {
    hideCompletionModal();
    initializeGame();
}

// ========================================
// EVENT BINDINGS
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeGame();

    document.getElementById('targetWord').textContent = CONFIG.WORD;
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    document.getElementById('hintBtn').addEventListener('click', handleHintRequest);
    document.getElementById('hintConfirmBtn').addEventListener('click', confirmHintUsage);
    document.getElementById('hintCancelBtn').addEventListener('click', cancelHintUsage);
    document.getElementById('submitScoreBtn').addEventListener('click', submitScore);
    document.getElementById('shareScoreBtn').addEventListener('click', handleShareScore);
    document.getElementById('playAgainBtn').addEventListener('click', () => {
        const nameInput = document.getElementById('playerName');
        const nameSection = document.getElementById('nameInputSection');
        const needsName = nameSection && nameSection.style.display !== 'none' && !nameInput.value.trim();
        if (needsName) {
            showToast('Please enter your name before continuing.');
            return;
        }
        hideCompletionModal();
        resetGame();
    });

    const nameInput = document.getElementById('playerName');
    nameInput.addEventListener('input', () => {
        const validationEl = document.getElementById('nameValidation');
        if (!nameInput.value.trim()) {
            nameInput.classList.remove('error');
            validationEl.textContent = '';
            validationEl.classList.remove('error');
            return;
        }

        const validation = validatePlayerName(nameInput.value);
        if (validation.valid) {
            nameInput.classList.remove('error');
            validationEl.textContent = '';
            validationEl.classList.remove('error');
        } else {
            validationEl.textContent = validation.error;
            validationEl.classList.add('error');
        }
    });

    window.addEventListener('resize', syncCanvasSize);

    // Mobile menu controls
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleMenu);
    }
    const menuBackdrop = document.getElementById('menuBackdrop');
    if (menuBackdrop) {
        menuBackdrop.addEventListener('click', closeMenu);
    }
    const menuCloseBtn = document.getElementById('menuCloseBtn');
    if (menuCloseBtn) {
        menuCloseBtn.addEventListener('click', closeMenu);
    }
    const menuLeaderboardBtn = document.getElementById('menuLeaderboardBtn');
    if (menuLeaderboardBtn) {
        menuLeaderboardBtn.addEventListener('click', () => {
            closeMenu();
            openLeaderboardOverlay();
        });
    }
    document.querySelectorAll('.menu-list a').forEach((link) => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Leaderboard overlay controls
    const leaderboardCloseBtn = document.getElementById('leaderboardCloseBtn');
    if (leaderboardCloseBtn) {
        leaderboardCloseBtn.addEventListener('click', closeLeaderboardOverlay);
    }
    const leaderboardOverlay = document.getElementById('leaderboardOverlay');
    if (leaderboardOverlay) {
        leaderboardOverlay.addEventListener('click', (event) => {
            if (event.target === leaderboardOverlay) {
                closeLeaderboardOverlay();
            }
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu();
            closeLeaderboardOverlay();
        }
    });

    const attemptHomeBtn = document.getElementById('attemptHomeBtn');
    if (attemptHomeBtn) {
        attemptHomeBtn.addEventListener('click', () => {
            closeMenu();
            closeLeaderboardOverlay();
            const overlay = document.getElementById('attemptLimitOverlay');
            if (overlay) {
                overlay.style.display = 'none';
            }
        });
    }
});

// ========================================

window.DEBUG = {
    state,
    CONFIG,
    SOLUTION_PATH,
};
