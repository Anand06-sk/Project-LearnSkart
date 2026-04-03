# GitHub Pages Deployment Guide

Deploy "LearnSkart Daily Path Puzzle" to the world in minutes!

---

## 📋 Prerequisites

- ✅ GitHub account (free at github.com)
- ✅ Your game files (index.html, style.css, script.js)
- ✅ Firebase project set up & config added

---

## 🚀 Quick Deploy (5 Minutes)

### Step 1: Prepare Your Files

Ensure you have in `/daily-puzzle/` folder:
```
daily-puzzle/
├── index.html
├── style.css
├── script.js
├── SETUP.md
├── FIREBASE_SETUP.md
└── README.md
```

### Step 2: Push to GitHub

```bash
# Navigate to your project
cd /path/to/Project-OpenNotes

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Add: LearnSkart Daily Path Puzzle game"

# Set remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/Project-OpenNotes.git

# Push to main branch
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to **GitHub.com** → Your **Project-OpenNotes** repository
2. Click **⚙️ Settings** (top-right)
3. Scroll to **"Pages"** (left sidebar)
4. Under **"Source"**:
   - Select **"Deploy from a branch"**
   - Choose branch: **main**
   - Choose folder: **/ (root)** or **/docs**
5. Click **Save**

GitHub will show:
```
✓ Your site is published at https://USERNAME.github.io/Project-OpenNotes/
```

### Step 4: Access Your Game

Your game is live at:
```
https://USERNAME.github.io/Project-OpenNotes/daily-puzzle/
```

---

## 📂 File Structure in Repository

```
Project-OpenNotes/
├── daily-puzzle/              ← Main game folder
│   ├── index.html            ← Start here
│   ├── style.css             ← All styling
│   ├── script.js             ← Game logic
│   ├── README.md             ← Game instructions
│   ├── SETUP.md              ← Full setup guide
│   └── FIREBASE_SETUP.md     ← Firebase config guide
├── [other project files]
└── .git/                      ← Git metadata
```

---

## ✨ Custom Domain (Optional)

Want `yoursite.com/daily-puzzle/` instead of `github.io`?

### Add Custom Domain

1. **Get a domain** from GoDaddy, Namecheap, etc.
2. In **GitHub Settings** → **Pages**:
   - Add "Custom domain" field
   - Enter: `yoursite.com`
3. Click **Save**
4. GitHub creates a **CNAME** file automatically
5. Configure DNS records at your domain provider:
   ```
   Type: CNAME
   Name: @
   Value: username.github.io
   ```

Takes ~24 hours to propagate.

---

## 🔄 Updating Your Game

After making changes:

```bash
# From project folder
git add .
git commit -m "Update: Fixed bug in hint system"
git push origin main
```

GitHub Pages auto-updates within 1-2 minutes. Refresh your browser!

---

## 🐛 Troubleshooting

### "Page not found" (404)

**Issue**: Browsing to wrong URL
```
❌ https://USERNAME.github.io/daily-puzzle/    (WRONG)
✅ https://USERNAME.github.io/Project-OpenNotes/daily-puzzle/  (RIGHT)
```

### "Repository not found"

**Issue**: Remote URL incorrect
```bash
# Check current remote
git remote -v

# Fix
git remote set-url origin https://github.com/YOUR_USERNAME/Project-OpenNotes.git
git push -u origin main
```

### Changes not appearing

**Issue**: GitHub Pages cache
```
Solution:
1. Hard refresh (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)
2. Use incognito/private browsing
3. Wait 5 minutes for CDN update
```

### Firebase not working on GitHub Pages

**Issue**: CORS or config error
```
Solution:
1. Check FIREBASE_CONFIG in script.js
2. Verify Firebase project allows your domain
3. Check browser console (F12) for specific errors
4. Ensure Firestore Rules are published
```

---

## 🔒 Security Notes

### Public Repository
Your code is visible to everyone - this is fine because:
- ✅ Firebase keys are limited in scope (Firestore only)
- ✅ No sensitive credentials in client code
- ✅ API keys restricted via Firebase Rules
- ✅ Server-side validation prevents abuse

### If Uploading to Private Repo
```bash
# Add .env file (not pushed to GitHub)
FIREBASE_API_KEY=xxxxx
```

But for this project, public is recommended for community feedback.

---

## 📊 Monitoring Deployment

### Check Deployment Status

1. Go to repository **Actions** tab
2. See build history
3. Green ✅ = Deployed successfully
4. Red ❌ = Build failed (check logs)

### View Logs

Click on a deployment to see:
- Build process
- Deployment time
- Any warnings/errors

---

## 🚀 Advanced: GitHub Actions (CI/CD)

Automate deployment with GitHub Actions:

### Create `.github/workflows/deploy.yml`

```yaml
name: Deploy Game to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

Benefits:
- ✅ Auto-deploy on push
- ✅ Build logs visible
- ✅ Rollback if error
- ✅ Status badge for README

---

## 💾 Backup & Version Control

### Keep Backup of Your Game

```bash
# Clone your own repo as backup
git clone https://github.com/YOUR_USERNAME/Project-OpenNotes.git backup-2024/
```

### View Change History

```bash
# See all commits
git log --oneline

# See specific file changes
git log -p daily-puzzle/script.js

# Compare versions
git diff HEAD daily-puzzle/script.js
```

### Revert Changes if Needed

```bash
# Undo last commit
git revert HEAD

# Restore specific file
git checkout HEAD^ -- daily-puzzle/script.js
```

---

## 📈 Analytics & Monitoring

### Add Website Analytics

#### Option 1: GitHub Insights (Built-in)
- Go to **Insights** tab in repository
- See traffic, clones, visitors

#### Option 2: Google Analytics (Recommended)

Add to `index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

Replace `GA_MEASUREMENT_ID` with your Google Analytics ID.

---

## 🎯 SEO Optimization (Optional)

### Add Meta Tags to index.html

```html
<meta name="description" content="Daily path puzzle game - Connect letters by swiping through all grid tiles">
<meta name="keywords" content="puzzle, game, learning, daily, path">
<meta name="author" content="LearnSkart">
<meta property="og:title" content="LearnSkart Daily Path Puzzle">
<meta property="og:description" content="Connect letters by visiting every grid tile">
<meta property="og:image" content="https://yoursite.com/preview.png">
<meta name="twitter:card" content="summary_large_image">
```

### robots.txt

Create `robots.txt` in repository root:

```
User-agent: *
Allow: /

Sitemap: https://username.github.io/Project-OpenNotes/sitemap.xml
```

---

## 🌍 Share Your Game

### Social Media

```
🎮 LearnSkart Daily Path Puzzle
Connect letters by swiping through all grid tiles!
🔥 Daily streaks, leaderboards, and competitive scoring.

Play now: https://username.github.io/Project-OpenNotes/daily-puzzle/

#GameDev #WebGame #Puzzle #LearnSkart
```

### Embed in Website

If you have another website, embed the game:

```html
<iframe 
  src="https://username.github.io/Project-OpenNotes/daily-puzzle/" 
  width="100%" 
  height="800" 
  frameborder="0">
</iframe>
```

### Share Button Code

```html
<a href="https://username.github.io/Project-OpenNotes/daily-puzzle/" 
   target="_blank" 
   class="play-button">
  🎮 Play Daily Puzzle
</a>
```

---

## 📱 Mobile App (Advanced)

Convert your web game to mobile app:

### Option 1: GitHub Pages Progressive Web App (PWA)

Add to `index.html`:

```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="apple-touch-icon" href="icon-192.png">
```

Users can "Add to Home Screen" → Opens like native app

### Option 2: Wrap in Cordova/Electron

Convert to true native app (advanced):
- Cordova: Android + iOS
- Electron: Desktop app
- React Native: If rebuild needed

---

## 🔧 Maintenance Checklist

### Weekly
- [ ] Test game functionality
- [ ] Check leaderboard loads
- [ ] Verify Firebase writes
- [ ] Monitor error logs

### Monthly
- [ ] Review GitHub Analytics
- [ ] Check for security updates
- [ ] Optimize Firebase indexes
- [ ] Clean old leaderboard data

### Quarterly
- [ ] Add new features
- [ ] Update Firebase rules if needed
- [ ] Review player feedback
- [ ] Plan improvements

---

## 📞 Getting Help

### Debug Deployment Issues

1. **Check GitHub Actions**: Repo → Actions tab
2. **Test locally first**:
   ```bash
   python -m http.server 8000
   # Visit http://localhost:8000/daily-puzzle/
   ```
3. **Verify all files uploaded**: GitHub repo → daily-puzzle folder
4. **Clear browser cache** and refresh

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| 404 Not Found | Wrong path | Use `/Project-OpenNotes/daily-puzzle/` |
| Firebase error | Config wrong | Check FIREBASE_CONFIG in script.js |
| Can't swipe | Browser issue | Try Chrome, Firefox, Safari |
| Slow loading | Large files | Compress images (none in this project) |

---

## 🎉 You're Live!

Your game is now accessible worldwide at:
```
https://USERNAME.github.io/Project-OpenNotes/daily-puzzle/
```

Share the link and watch players climb the leaderboard! 🚀

---

## 📚 Additional Resources

- **GitHub Pages Docs**: https://pages.github.com
- **Git Cheat Sheet**: https://github.github.com/training-kit/
- **Firebase Hosting**: https://firebase.google.com/docs/hosting
- **Web Performance Tips**: https://web.dev

---

**Happy deploying!** 🎮✨

Last updated: March 2024
