# LearnSkart Daily Path Puzzle - Setup & Deployment Guide

## Project Overview

A production-ready, mobile-first web-based game with:
- **Swipe-based letter path puzzle** requiring full grid traversal
- **Daily unique puzzle** system
- **Firebase Firestore leaderboard** with top 20 scores
- **Streak tracking** with localStorage
- **Hint system** with time penalties
- **Responsive design** for all devices

---

## File Structure

```
daily-puzzle/
├── index.html          # Main HTML structure
├── style.css           # Complete styling & animations
├── script.js           # Game engine & Firebase integration
└── README.md           # This file
```

---

## SETUP INSTRUCTIONS

### 1. Firebase Configuration

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `LearnSkart-DailyPuzzle`
4. Click through to finish setup

#### Enable Firestore

1. In Firebase Console, go to **Build** > **Firestore Database**
2. Click **"Create Database"**
3. Select **"Start in test mode"** (for development)
4. Choose a region close to your users
5. Click **"Enable"**

#### Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to **"Your apps"** section
3. Click **"Database"** or **"Web"** to register a web app
4. Copy the config object that looks like:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456",
};
```

#### Update script.js

Replace the `FIREBASE_CONFIG` object in `script.js` (lines 15-22) with your actual Firebase credentials:

```javascript
const FIREBASE_CONFIG = {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'YOUR_PROJECT.firebaseapp.com',
    projectId: 'YOUR_FIREBASE_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT.appspot.com',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
};
```

#### Set Firestore Security Rules (Test Mode → Production)

In Firestore Console, go to **Rules** tab and replace with:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all leaderboard scores
    match /leaderboard/{puzzle_id}/scores/{score_id} {
      allow read: if true;
      allow create: if request.resource.data.name is string
        && request.resource.data.name.size() >= 3
        && request.resource.data.name.size() <= 16
        && request.resource.data.time is number
        && request.resource.data.time > 0
        && request.resource.data.time <= 300
        && request.resource.data.timestamp is timestamp;
      allow update, delete: if false;
    }
  }
}
```

Click **"Publish"**

---

### 2. GitHub Pages Deployment

#### Option A: Deploy from `/daily-puzzle` folder

1. Go to your GitHub repository settings
2. Navigate to **Settings** > **Pages**
3. Select **"Deploy from a branch"**
4. Choose branch (usually `main`)
5. Select folder: `/root` (if files are in root) or `/docs` 
6. If files are in `/daily-puzzle` folder, configure accordingly
7. Click **Save**

Your game will be live at:
```
https://yourusername.github.io/Project-OpenNotes/daily-puzzle/
```

#### Option B: Using GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3.9.3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./daily-puzzle/
        cname: yourdomain.com  # Optional: custom domain
```

---

### 3. Local Testing

#### Test Locally Before Deployment

1. Open `index.html` in your browser
2. Or use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server
```

Access at: `http://localhost:8000/daily-puzzle/`

#### Test Firebase Connection

1. Open browser **DevTools** (F12 or Cmd+Option+I)
2. Check **Console** tab for:
   - `"Firebase initialized successfully"` ✓
   - No errors about missing credentials

#### Test Game Flow

1. **Start game**: Tap grid to begin
2. **Connect letters**: Swipe to form `LEARNSKART`
3. **Visit all tiles**: Must cover entire grid
4. **Early finish**: Reaching final letter before all tiles shows warning
5. **Complete**: All tiles + correct word = success
6. **Submit**: Enter name and save to leaderboard

---

## FEATURES & GAME LOGIC

### Daily Puzzle Generation

- **Algorithm**: Hamiltonian Path (DFS with backtracking)
- **Grid**: 5×5 (25 cells) or 6×6 (36 cells)
- **Word**: `LEARNSKART` (10 letters)
- **Path**: Covers all grid cells exactly once
- **Letters**: Placed non-sequentially along the path
- **ID**: `puzzle_YYYY_MM_DD` (same for all users each day)

### Game Rules

✅ **Must achieve all of these**:
1. Start with letter 'L'
2. Form complete word 'LEARNSKART'
3. Move only to adjacent tiles (up, down, left, right)
4. Visit ALL tiles on the grid
5. End on final letter 'T' AFTER full traversal

❌ **Game state checks**:
- Reaching 'T' early → Show warning + pulse animation
- Word complete but incomplete grid → Show warning
- Invalid move → Red flash + shake animation

### Backtracking

- Reverse swipe removes path steps smoothly
- Can backtrack multiple steps
- Continues from any point in path

### Hint System

**First hint** (uses modal):
```
"Using a hint will add +5 seconds to your time"
```

**All hints**:
- +5 seconds penalty (automatic after first)
- Show light blue path to next letter
- Fade out after 2 seconds
- 2-second cooldown between hints

### Streak System

- **Tracked**: localStorage key `dailyPuzzleStreak`
- **Increment**: If played yesterday + today
- **Display**: 🔥 icon on header with animation
- **Reset**: If missed a day

### Submission Limits

- **Max 2 scores per day** per user
- Tracked in localStorage by date
- After 2 submissions: "Max submissions reached"

### Time Validation

- **Maximum**: 300 seconds (5 minutes)
- **Firebase validation**: Server rejects times > 300s
- **Early reset**: Game auto-resets if time exceeded

---

## FIREBASE DATA STRUCTURE

### Firestore Collections

```
leaderboard/
└── puzzle_2024_03_22/        (document ID)
    └── scores/               (subcollection)
        ├── {auto_doc_1}
        │   ├── name: "Alice"
        │   ├── time: 45
        │   └── timestamp: 2024-03-22T10:30:00Z
        ├── {auto_doc_2}
        │   ├── name: "Bob"
        │   ├── time: 52
        │   └── timestamp: 2024-03-22T10:35:00Z
        └── ...
```

### Firestore Query

```javascript
// Fetches top 20 scores, sorted by time ascending
db.collection('leaderboard')
    .doc('puzzle_2024_03_22')
    .collection('scores')
    .orderBy('time', 'asc')
    .limit(20)
    .get()
```

---

## CUSTOMIZATION

### Change Word

In `script.js`, line 11:
```javascript
WORD: 'LEARNSKART'  // Change to any word (max 10 letters)
```

### Change Grid Size

In `script.js`, line 10:
```javascript
GRID_SIZE: 5  // Change to 6, 7, etc.
```

### Change Theme Color

In `style.css`, line 9:
```css
--color-primary: #2563eb;  /* Blue - change this */
```

Example alternatives:
```css
#dc2626  /* Red */
#059669  /* Green */
#7c3aed  /* Purple */
#0891b2  /* Cyan */
```

### Change Timer Penalty for Hint

In `script.js`, line 13:
```javascript
HINT_TIME_PENALTY: 5,  // Change to 10 for 10 seconds
```

---

## PERFORMANCE OPTIMIZATION

### Already Implemented

✅ CSS transitions for smooth animations (60 FPS)
✅ Canvas rendering for path drawing
✅ Efficient tile update logic
✅ No DOM thrashing during swipe
✅ Touch event handler optimization
✅ Lazy Firebase initialization

### Mobile Optimization

✅ Touch event handling with proper flags
✅ Viewport meta tags configured
✅ No zoom on double-tap
✅ Responsive grid sizing
✅ 60-80px tiles (23-32mm) - comfortable touch targets

### Test Performance

1. Open **DevTools** > **Performance** tab
2. Record gameplay
3. Check:
   - Main thread: <16ms per frame (60 FPS)
   - No memory leaks
   - Canvas rendering efficient

---

## TROUBLESHOOTING

### Firebase Not Initializing

```javascript
// Check console for errors
// If error: "Missing credentials"
// → Verify FIREBASE_CONFIG is correct (no typos)
// → Check Firebase project exists
```

### Leaderboard Not Loading

```javascript
// Check Firestore Rules
// Settings > Firestore > Rules tab
// All rules must be published

// Check console Network tab
// Verify API calls to firestore.googleapis.com
```

### Puzzle Not Solvable

```javascript
// This should never happen with Hamiltonian path
// If it does: Check DEBUG.generateDailyPuzzle()
window.DEBUG.generateDailyPuzzle()  // In console
```

### Swipe Not Working

```javascript
// Ensure touch events are enabled
// Check for CSS pointer-events: none
// Verify no parent div has touch-action: none
```

### Score Not Saving

```javascript
// Check:
// 1. Name validation (minimum 3 chars, letters only)
// 2. Time < 300 seconds
// 3. Firebase rules allow writes
// 4. Open DevTools > Network tab to see request
```

---

## BROWSER COMPATIBILITY

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 90+ | ✅ Full | Recommended |
| Firefox 88+ | ✅ Full | Full support |
| Safari 14+ | ✅ Full | iOS & macOS |
| Edge 90+ | ✅ Full | Chromium-based |
| IE 11 | ❌ No | No support |

---

## SECURITY NOTES

### Data Validation

✅ **Client-side**:
- Name: 3-16 chars, letters & spaces only
- Time: Positive number, < 300 seconds

✅ **Server-side** (Firestore Rules):
- Validates all submitted data
- Rejects invalid entries
- No SQL injection possible (Firestore)

### Privacy & GDPR

- **No personal data** beyond player name
- **No cookies** used
- **localStorage** only for streak/submissions (local device only)
- **Firebase** stores minimal data

---

## MONITORING & ANALYTICS

### Add Google Analytics (Optional)

```html
<!-- Add to index.html before closing </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Firebase Analytics Integration

Already available via Firebase SDK - tracks sessions automatically.

---

## DEPLOYMENT CHECKLIST

- [ ] Firebase project created
- [ ] Firestore database enabled (test mode → production rules)
- [ ] Firebase config inserted in `script.js`
- [ ] Local testing completed (all features work)
- [ ] Tested on mobile device
- [ ] GitHub repository created
- [ ] Files committed to `/daily-puzzle/` folder
- [ ] GitHub Pages enabled
- [ ] Live URL tested and working
- [ ] Leaderboard tested (submit a score)
- [ ] Streaks tested (localStorage visible)

---

## FUTURE ENHANCEMENTS

Potential features to add:

1. **Daily variation**: Different words/grid sizes per day
2. **Power-ups**: Speed boost, freeze time, skip tile
3. **Sound effects**: Swipe sound, completion sound
4. **Animations**: Tile reveal animations, level progression
5. **Multiplayer**: Real-time competitive mode
6. **Statistics**: Personal best times, average, total plays
7. **Achievements**: Dark mode, badges, milestones
8. **Difficulty levels**: Easy (small grid), Hard (larger grid)

---

## SUPPORT & CONTACT

For issues or questions:
1. Check **Console errors** (DevTools)
2. Verify **Firebase config**
3. Test with **sample puzzle** (check `window.DEBUG`)

---

## LICENSE

Production-ready code for LearnSkart. All rights reserved.

---

**Last Updated**: March 2024
**Version**: 1.0.0
**Status**: Production Ready ✓
