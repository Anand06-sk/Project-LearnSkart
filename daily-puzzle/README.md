# LearnSkart Daily Path Puzzle 🎮

A daily interactive puzzle game where players swipe through a grid to connect letters while visiting every tile exactly once.

**Live Demo**: [GitHub Pages URL - Update after deployment]

---

## 🎯 How to Play

### Objective
Connect the letters **L-E-A-R-N-S-K-A-R-T** by swiping through tiles, BUT you must also visit **every tile on the grid** before finishing.

### Game Rules

1. **Start**: Tap the first letter `L` to begin
2. **Connect**: Swipe to adjacent tiles (up, down, left, right only)
3. **Form Word**: Visit letters in order: `L→E→A→R→N→S→K→A→R→T`
4. **Cover Grid**: Visit ALL tiles (including empty ones)
5. **Finish**: Complete the word ONLY after visiting all tiles

### Examples

✅ **WIN**: Word complete + All 25 tiles visited
```
Path: L E A R N S K A R T [+ 15 empty tiles]
Progress: 10/10 letters, 25/25 tiles ✓
```

❌ **NOT YET**: Word complete but grid not full
```
Path: L E A R N S K A R T (only 10 tiles)
Message: "Word completed, but puzzle not finished!"
Action: Keep swiping to visit remaining tiles
```

### Controls

**Mobile**: Swipe your finger across tiles
**Desktop**: Click and drag across tiles

### Backtracking

Remove steps by swiping backwards:
- Tap previous tile in path
- Or swipe in reverse direction
- Entire path unwinds smoothly

---

## 🎮 Game Features

### Daily Puzzle
- **New puzzle**: Every day at midnight
- **Same for all**: Everyone gets the same puzzle daily
- **Unique generation**: Randomly placed letters each day

### Hint System
- **First hint**: Confirmation modal (shows +5s penalty)
- **Following hints**: Automatic +5s penalty
- **Hint shows**: Light blue path to next letter
- **Cooldown**: 2-second wait between hints

### Timer
- Starts when you first touch the grid
- Counts up from 00:00
- Hint usage adds time penalty (+5s per hint)

### Leaderboard
- **Top 20 players** displayed after completion
- **Sorted by**: Fastest time first
- **Personal submission**: Max 2 per day
- **Persistence**: Saved in Firebase

### Streak System 🔥
- Increments if you play on consecutive days
- Resets if you miss a day
- Shows as flame emoji on header
- Animated pulse effect

---

## 🎨 Visual Design

### Color Scheme
- **Primary**: Blue (#2563eb) - main actions
- **Background**: Light gray gradient
- **Success**: Green (#10b981)
- **Warning**: Orange (#f59e0b)
- **Error**: Red (#ef4444)

### Grid Display
- **Tiles**: 5×5 responsive grid
- **Tile size**: 60-80px (fits any phone)
- **Letter tiles**: Visible letters
- **Empty tiles**: Blank but still playable
- **Path**: Animated blue line showing your swipe trail

### Animations
- **Smooth**: CSS transitions all movement
- **60 FPS**: Canvas rendering for path
- **Confetti**: Celebration on completion
- **Glow effects**: Selected tiles pulse

---

## 📊 Game Completion Flow

### Step 1: Play
Swipe through grid connecting all letters and visiting all tiles

### Step 2: Complete
Page shows:
```
🎉 Puzzle Complete!
Time Taken: 00:45
Your Rank: #1
```

### Step 3: Submit Score
Enter your name (3-16 characters, letters only)
- Firebase saves to global leaderboard
- You see where you rank

### Step 4: View Leaderboard
See top 20 players with times and ranks

---

## 🔄 Backtracking Example

```
Initial path:  L → E → A → R → (5 tiles)

You realize wrong path, so:

Swipe backwards on    → Path becomes: L → E → A
tile 'A'

Continue new path:    → L → E → A → R → N (different direction)
```

**No penalty** for backtracking - just adjust your path!

---

## ⏰ Time & Scoring

### How Score is Calculated
- **Score = Time Taken** (fastest wins)
- Example: 45 seconds = Rank based on completion time

### Improvements
- **Hints**: Each hint costs +5 seconds
- **Example**: 40 seconds + 2 hints = 50 seconds (final score)

### Rank Tiers
```
🥇 1st place  = <30 seconds
🥈 2nd place  = <45 seconds
🥉 3rd place  = <60 seconds
...
#20 position  = Varies by day
```

Rank is displayed as:
- 🥇 emoji for top 3
- 👤 number for 4-20
- "outside top 20" if more players

---

## 🌍 Mobile Experience

### Touch Optimized
- Large tap targets (60-80px)
- Smooth swipe tracking
- No lag on low-end phones
- Proper viewport settings

### Responsive
- Works on all screen sizes
- Portrait & landscape modes
- No horizontal scrolling
- Auto-scales grid

### Performance
- ~60 FPS gameplay
- < 1MB total (HTML+CSS+JS)
- No external dependencies
- Fast Firebase queries

---

## 🔐 Data & Privacy

### What We Store
**Firebase Firestore**:
- Player name
- Time taken
- Timestamp

**localStorage** (Your device only):
- Daily streak count
- Number of submissions today
- Last play date

### What We DON'T Store
- No email or personal info
- No cookies
- No tracking pixels
- No unnecessary game data

### Data Retention
- Leaderboard: 30 days rolling
- Local storage: Clears daily at midnight

---

## 🚀 Technical Stack

### Frontend
- **HTML5**: Semantic structure
- **CSS3**: Animations, grid, flexbox
- **JavaScript (ES6+)**: Game engine
- **Canvas API**: Path drawing

### Backend
- **Firebase Firestore**: Real-time database
- **Firebase Rules**: Data validation
- **Cloud Functions**: (Optional) daily reset

### Hosting
- **GitHub Pages**: Free static hosting
- **CDN**: Firebase-hosted JS libraries

### No External Dependencies
- No jQuery
- No React/Vue/Angular
- No Canvas library
- Pure vanilla JavaScript

---

## 📈 Stats & Analytics

### Game Statistics Tracked
- Total games played (localStorage)
- Streak count (localStorage)
- Best time (future: local dashboard)
- Total time spent (future)

### Leaderboard Stats
Accessible via Firebase Console:
- Most common times
- Average completion time
- Peak play times
- Player distribution

---

## 🎮 Keyboard Shortcuts (Desktop)

| Key | Action |
|-----|--------|
| `R` | Reset current puzzle |
| `H` | Use hint |
| `E` | Submit score |
| `L` | View leaderboard |

(Shortcuts only work outside input fields)

---

## ❓ FAQ

**Q: What if I reach the final letter 'T' before visiting all tiles?**
A: Game shows a message asking you to continue and visit remaining tiles.

**Q: Can I play twice in one day?**
A: Yes! You can play unlimited times. But only your top 2 scores are submitted to the leaderboard.

**Q: Does leaderboard reset daily?**
A: Yes! Each day has its own leaderboard puzzle (e.g., `puzzle_2024_03_22`).

**Q: What if two players tie?**
A: They're both ranked—displayed in order of submission.

**Q: Can I undo my submission?**
A: No, but you can submit up to 2 times per day.

**Q: Why can't I see someone's time?**
A: The leaderboard only shows top 20. Check back tomorrow if below rank 20.

**Q: Does my name get shared?**
A: Yes, your name appears on the public leaderboard.

**Q: What if I'm offline?**
A: Game plays fine offline. Leaderboard submits when connection returns.

**Q: How is the puzzle generated?**
A: Algorithm: Hamiltonian Path (visits every grid cell exactly once), with letters placed non-sequentially.

---

## 🐛 Known Limitations

- Grid size fixed at 5×5 (25 tiles)
- Only one puzzle per day
- Max name length: 16 characters
- Leaderboard shows top 20 only
- Test mode Firebase (development only)

---

## 🚀 Future Features

- [ ] Daily word variations
- [ ] Difficulty levels (easy/medium/hard)
- [ ] Power-ups (freeze time, skip tile)
- [ ] Sound effects & music toggle
- [ ] Personal statistics dashboard
- [ ] Achievements & badges
- [ ] Dark mode toggle
- [ ] Multiplayer race mode
- [ ] Word hints (dictionary definitions)
- [ ] Seasonal leaderboards

---

## 🤝 Contributing

Have ideas? Found a bug? 

1. Test thoroughly
2. Report exact steps to reproduce
3. Include screenshot if possible
4. Check browser console for errors

---

## 📝 Game Design Notes

### Puzzle Difficulty Algorithm
- **Grid coverage**: 25 tiles for moderate difficulty
- **Hidden path**: Letters not visible in sequence
- **Hamiltonian requirement**: No tile skipping
- **Early-finish prevention**: Ensures full engagement

### Why This Works
- Engaging: Hidden path discovered through play
- Fair: Same puzzle for all users
- Challenging: Balance of exploration & logic
- Social: Leaderboard competition

---

## 🎓 Educational Value

While primarily entertainment, the game exercises:
- **Spatial reasoning**: Grid navigation
- **Pattern recognition**: Finding word path
- **Memory**: Tile locations
- **Problem-solving**: Finding optimal route
- **Time management**: Speed improvement

Perfect for:
- Brain training
- Daily mental exercise
- Competitive play
- Skill development

---

## 📞 Support

### Issue Troubleshooting

**Game won't start**:
- Clear browser cache
- Try incognito mode
- Check console (F12)

**Can't swipe**:
- Enable touch on device
- Try mouse on desktop
- Check browser supports touch events

**Score won't save**:
- Verify name (3-16 chars, letters only)
- Check Firebase connection (console error?)
- Ensure time < 300 seconds

**Leaderboard blank**:
- Refresh page
- Check Firebase rules are published
- Wait 10-20 seconds for load

---

## 🎯 Game Philosophy

**Core Principle**: "Discover through Play"

- Letters hidden in grid
- Path must be found, not shown
- Challenge combines navigation + word knowledge
- Multiple valid routes possible
- Each player's journey unique

---

## 🏆 Scoring Criteria

1. **Completion Speed**: Ranked by time (lower = better)
2. **Accuracy**: Must visit all tiles + form word correctly
3. **Consistency**: Daily leaderboard shows improvement tracking
4. **Streak**: Rewards commitment to daily play

---

## 📱 Device Compatibility

| Device | Support | Notes |
|--------|---------|-------|
| iPhone (13+) | ✅ Full | Safari recommended |
| Android | ✅ Full | Chrome recommended |
| iPad | ✅ Full | Landscape supported |
| Desktop | ✅ Full | Mouse/keyboard support |
| Tablet | ✅ Full | 7"+ screens optimal |

---

## Made with ❤️ for LearnSkart

**Version**: 1.0.0  
**Updated**: March 2024  
**Status**: Production Ready ✓

---

**Ready to play? [Start Game](index.html)** 🎮
