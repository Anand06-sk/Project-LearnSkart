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

const CONFIG = {
    GRID_SIZE: 6,
    WORD: 'LEARNSKART',
    LETTER_PATH_INDICES: [0, 4, 8, 12, 16, 20, 25, 29, 32, 35],
    HINT_TIME_PENALTY: 5,
    LEADERBOARD_LIMIT: 20,
    MAX_TIME_SECONDS: 900,
    MAX_SUBMISSIONS_PER_DAY: 2,
    MAX_ATTEMPTS_PER_DAY: 2,
};

CONFIG.TOTAL_TILES = CONFIG.GRID_SIZE * CONFIG.GRID_SIZE;

const SOLUTION_PATH = buildSerpentinePath(CONFIG.GRID_SIZE);
const SOLUTION_INDEX_LOOKUP = new Map();
SOLUTION_PATH.forEach((coord, index) => {
    SOLUTION_INDEX_LOOKUP.set(coordKey(coord.row, coord.col), index);
});
const LETTER_COORDS = CONFIG.LETTER_PATH_INDICES.map(index => SOLUTION_PATH[index]);
const LETTER_COORD_KEY_LOOKUP = new Map(
    LETTER_COORDS.map((coord, idx) => [coordKey(coord.row, coord.col), idx])
);
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
    hintAcknowledged: false,
    attemptRecorded: false,
    attemptsLocked: false,
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
    if (!state.attemptRecorded) {
        recordAttemptStart();
        state.attemptRecorded = true;
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
    if (!state.isAnimatingPath) {
        drawLivePath();
    }
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
        processTile(element);
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
        processTile(element);
    }
}

function handleMouseUp() {
    state.mouseDown = false;
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
    drawLivePath();
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
    drawLivePath();
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
    clearHintOverlay();
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
    let fromIndex = SOLUTION_INDEX_LOOKUP.get(coordKey(lastStep.row, lastStep.col));
    const targetIndex = CONFIG.LETTER_PATH_INDICES[progress];

    if (typeof fromIndex !== 'number') {
        fromIndex = CONFIG.LETTER_PATH_INDICES[Math.max(progress - 1, 0)];
    }

    if (targetIndex <= fromIndex) {
        showToast('Move forward to reach the next letter.');
        return;
    }

    const segment = SOLUTION_PATH.slice(fromIndex, targetIndex + 1);
    drawHintOverlay(segment);
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

function drawHintOverlay(segment) {
    if (!state.ctx) return;
    clearHintOverlay();
    const ctx = state.ctx;
    const points = segment.map(({ row, col }) => getTileCenter(row, col));

    ctx.save();
    ctx.strokeStyle = 'rgba(129, 212, 250, 0.9)';
    ctx.lineWidth = 6;
    ctx.setLineDash([10, 10]);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.restore();

    state.hintOverlayTimeout = setTimeout(() => {
        drawLivePath();
        state.hintOverlayTimeout = null;
    }, 2000);
}

function clearHintOverlay() {
    if (state.hintOverlayTimeout) {
        clearTimeout(state.hintOverlayTimeout);
        state.hintOverlayTimeout = null;
    }
    drawLivePath();
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
            showToast('Score submitted!');
            localStorage.setItem('dailyPathLastName', trimmedName);
            nameInput.value = '';
            await refreshAllLeaderboards();
            await updateRankBanner(true);
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
    document.getElementById('playAgainBtn').addEventListener('click', () => {
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
// DEBUG HELPERS
// ========================================

window.DEBUG = {
    state,
    CONFIG,
    SOLUTION_PATH,
};
