# LearnSkart: Academic Notes Hub

A lightweight, mobile-ready site that delivers engineering notes by department, regulation, semester, and subject—served directly from GitHub Pages.

## Key features
- Department-wise navigation for CSE, ECE, EEE, Mechanical, Civil, and IT
- Filters by regulation, semester, and subject to pinpoint resources quickly
- PDF delivery via Google Drive links managed through JSON data files
- Dark mode toggle and responsive layout for phones and desktops
- Pure HTML, CSS, and JavaScript—no backend or build step needed

## Tech stack
- HTML for structure
- CSS for theming, responsiveness, and dark mode
- Vanilla JavaScript for data loading, filtering, and interactions
- GitHub Pages for static hosting

## Folder overview
- [Home/](Home/): Landing, navigation, about, core styles, and theme logic
- [Dept/](Dept/): Department pages and styling
- [pdfs/](pdfs/): PDF listings and data
- [question paper/](question%20paper/): Question paper listings and scripts
- [syllabus/](syllabus/): Syllabus listings and PDF view
- Root utilities: [calculator.html](calculator.html), [disclaimer.html](disclaimer.html), [privacy.html](privacy.html), shared data [notes.json](notes.json)

## How it works (Google Drive + JSON)
- PDF links are stored in Google Drive and referenced in JSON files (for example, [pdfs/data.json](pdfs/data.json), [question paper/qn.json](question%20paper/qn.json), [syllabus/sydata.json](syllabus/sydata.json)).
- Pages fetch the JSON, render available departments/semesters/subjects, and output links that open the Drive-hosted PDFs.
- All logic runs client-side; updates require only editing the JSON files and redeploying via GitHub Pages.

## Live site
- GitHub Pages: _Add the published URL here (e.g., https://your-username.github.io/LearnSkart/)_

## Usage
- Clone or download the repository.
- Open [Home/index.html](Home/index.html) locally, or serve the root with any static server (e.g., `python -m http.server 8000`).
- Toggle dark mode from the UI; browse by department, regulation, semester, and subject.
- Update JSON files to add or edit resources, ensuring the Google Drive links remain accessible.

## Future improvements
- Search across all departments and subjects
- Offline-ready caching for recently viewed PDFs
- Admin-friendly JSON editor UI
- Accessibility refinements and print-friendly views

## Disclaimer
- All materials are for educational purposes only. Ownership of each PDF remains with the original author or publisher. If you are a rights holder and want content removed, please open an issue or contact the maintainer.
