# Firebase Quick Start Guide

## 5-Minute Setup

### Step 1: Create Firebase Project (1 min)

1. Go to **[firebase.google.com](https://firebase.google.com)**
2. Click **"Get Started"**
3. Click **"Add Project"**
4. Enter name: **LearnSkart-Puzzle**
5. Click through → **Create project**

### Step 2: Set Up Firestore (2 min)

1. In Firebase Console, click **"Firestore Database"** (left menu, under Build)
2. Click **"Create Database"**
3. Select: **"Start in test mode"**
4. Select region closest to you (e.g., us-east1)
5. Click **"Create"**

### Step 3: Get Your Config (1 min)

1. Click **⚙️ Project Settings** (top-right)
2. Scroll down to **"Your apps"**
3. Click **"Web"** (or the web app icon)
4. Copy the config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "project.firebaseapp.com",
  projectId: "project-id",
  storageBucket: "project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

### Step 4: Update Your Code (1 min)

In **`script.js`**, find this section (around line 15):

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

Replace `'YOUR_...'` with actual values from your config.

### Step 5: Set Security Rules (Firestore)

1. In Firestore Console, go to **"Rules"** tab
2. Click **"Edit Rules"**
3. Delete everything and paste:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leaderboard/{puzzle_id}/scores/{score_id} {
      allow read: if true;
      allow create: if request.resource.data.name is string
        && request.resource.data.name.size() >= 3
        && request.resource.data.name.size() <= 16
        && request.resource.data.time is number
        && request.resource.data.time > 0
        && request.resource.data.time <= 300;
      allow update, delete: if false;
    }
  }
}
```

4. Click **"Publish"** (blue button, bottom-right)

---

## ✅ Done! Your Firebase is Ready

Open `index.html` in browser → **DevTools Console** should show:
```
Firebase initialized successfully
```

---

## Firestore Data Structure Reference

Your leaderboard will auto-create this structure:

```
leaderboard/ (collection)
  ├── puzzle_2024_03_22/ (document - dates auto-created)
  │   └── scores/ (subcollection)
  │       ├── randomId1: {name: "Alice", time: 45}
  │       ├── randomId2: {name: "Bob", time: 52}
  │       └── ...
  ├── puzzle_2024_03_23/
  │   └── scores/
  │       ├── randomId3: {name: "Charlie", time: 38}
  │       └── ...
```

---

## How It Works

1. **Player completes game** → Enters name
2. **Player clicks "Submit Score"** → JavaScript saves to Firebase
3. **Firebase validates**: Name format ✓, Time valid ✓
4. **Data saved** to `leaderboard/puzzle_YYYY_MM_DD/scores/`
5. **Leaderboard fetches** top 20 scores, sorted by time
6. **Displays** on completion screen

---

## Testing

### Test Write Access

1. Open game in browser
2. Play until completion
3. Enter a name: **"TestPlayer"**
4. Submit
5. Check Firebase Console → Firestore → leaderboard → puzzle_[today's date] → scores

You should see your entry! ✓

### Test Leaderboard Read

1. Check the "Today's Top Players" section
2. You should see your submission ranked by time

---

## Firestore Pricing

- **Free tier** (`Spark` plan):
  - ✅ 1GB storage
  - ✅ 50k reads/day
  - ✅ 20k writes/day
  - Enough for hundreds of daily players

- **Paid tier** (if you grow):
  - $0.06 per 100k reads
  - $0.18 per 100k writes
  - Very affordable

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `FirebaseError: Missing or insufficient permissions` | Check Firestore Rules are published |
| "Firebase is not defined" | Verify `<script>` tags in HTML |
| Score not saving | Check name validation (3-16 chars, letters only) |
| Leaderboard blank | Check Firestore Rules allow reads |
| Console shows "apiKey undefined" | Check FIREBASE_CONFIG has correct values |

---

## Security Best Practices

✅ **Already implemented**:
- Firestore Rules validate data
- No write access without validation
- Time limited to 300 seconds
- Name format restricted

✅ **Optional additions**:
- Rate limiting per IP (Firebase Security Rules)
- Age-based data retention policies
- Backup snapshots

---

## Need Help?

1. **Check DevTools Console** (F12) → any errors?
2. **Firebase Console** → Firestore → Check data saved?
3. **Network tab** → any failed requests to firestore?

---

**You're all set! Your game is ready to use Firebase.** 🚀
