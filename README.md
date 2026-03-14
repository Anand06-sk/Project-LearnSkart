# LearnSkart: Academic Resource Hub

A lightweight, mobile-responsive static website for engineering students to access study notes, previous-year question papers, syllabus PDFs, and GATE resources.

## Overview

LearnSkart organizes academic content by:
- Department (CSE, ECE, EEE, IT, MECH, CIVIL)
- Regulation
- Semester
- Subject

The site is built as a pure static project (HTML/CSS/JavaScript) and is designed for GitHub Pages hosting.

## Key Features

- Department-wise academic navigation
- Regulation + semester based filtering
- Subject-wise resource discovery
- Previous-year question paper pages under `pyq/`
- GATE stream pages under `gate/`
- Anna University results hub page under `anna-university-results/`
- CGPA calculator
- Dark mode support
- Mobile-first responsive UI

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- JSON-driven content (`assets/data/*.json`)
- Google Drive hosted PDFs
- GitHub Pages deployment

## Current Project Structure

```text
Project-OpenNotes/
├── index.html
├── README.md
├── LICENSE
├── sitemap.xml
├── google098b234d6180b677.html
├── about/
├── anna-university-results/
├── anna-university-notes/
│   ├── civil/
│   ├── cse/
│   ├── ece/
│   ├── eee/
│   ├── it/
│   └── mech/
├── assets/
│   ├── css/
│   ├── data/
│   ├── icons/
│   └── js/
├── cgpa-calculator/
├── disclaimer/
├── gate/
├── gate-pyqs/
├── previous-year-questions/
├── privacy/
├── pyq/
│   ├── CE3351-surveying-and-levelling/
│   ├── CE3401-applied-hydraulics-engineering/
│   ├── CE3701-estimation-coasting-and-valuation-engineering/
│   ├── CS3501-compiler-design/
│   ├── EE3404-microprocessor-and-microcontroller/
│   ├── IT3501-full-stack-web-development/
│   └── ...
├── scripts/
└── syllabus/
   ├── index.html
   ├── 2021/
   │   ├── civil/
   │   ├── cse/
   │   ├── ece/
   │   ├── eee/
   │   ├── it/
   │   └── mech/
   ├── 2025/
   │   ├── civil/
   │   ├── cse/
   │   ├── ece/
   │   ├── eee/
   │   ├── it/
   │   └── mech/
   ├── civil/
   ├── cse/
   ├── ece/
   ├── eee/
   ├── it/
   └── mech/
```

## Data Sources

- `assets/data/data.json` → Notes/resources for academics pages
- `assets/data/qn.json` → Previous-year question paper metadata and links
- `assets/data/sydata.json` → Syllabus data
- `assets/data/gate-qns.json` → GATE question content
- `assets/data/*-templates.json` → Page generation templates

## Build/Generation Scripts

In `scripts/`:

- `build-academics-pages.js`
- `build-pyq-pages.js`
- `build-syllabus-pages.js`
- `build-gate-pages.js`
- `generate-academics-templates.js`
- `generate-pyq-templates.js`
- `generate-pyq-index.js`
- `update-academics-index-links.js`
- `fix-pyq-theme.js`

These scripts help generate and maintain static pages from JSON/template data.

## Local Development

1. Clone the repo:
   ```bash
   git clone https://github.com/anand06-sk/Project-LearnSkart.git
   cd Project-OpenNotes
   ```

2. Run a local static server (recommended):
   ```bash
   python -m http.server 8000
   ```

3. Open:
   ```text
   http://localhost:8000
   ```

## Content Update Workflow

1. Upload PDF to Google Drive and enable public view access.
2. Add/update entries in relevant JSON file under `assets/data/`.
3. If needed, run generation scripts in `scripts/`.
4. Verify pages locally.
5. Push changes to deploy on GitHub Pages.

## Notes on Routing

- PYQ pages use folder-based routes under `pyq/`.
- The sitemap should mirror the exact `pyq/` folder names used in the repository.
- Syllabus department landing pages are regulation-based under `syllabus/2021/` and `syllabus/2025/`.
- Subject syllabus pages continue under department routes like `syllabus/cse/...` and `syllabus/ece/...`.
- Current PYQ route examples include `pyq/CE3351-surveying-and-levelling/`, `pyq/CE3701-estimation-coasting-and-valuation-engineering/`, `pyq/CS3501-compiler-design/`, `pyq/IT3501-full-stack-web-development/`, and `pyq/PH3201-physics-for-civil-engineering/`.
- Keep subject slugs in links consistent with real folder names.
- For GitHub Pages project-site hosting, prefer relative internal links (for example `../pyq/.../` or `../../gate/.../`) instead of root-absolute links like `/pyq/.../`.

## Disclaimer

This project is for educational use. All document ownership belongs to original authors/publishers/institutions. If you are a rights holder and need removal, contact the maintainer.

## Contributors

- [@Anand06-sk](https://github.com/Anand06-sk)
- [@AnuN2006](https://github.com/AnuN2006)

---

Made with ❤️ for students.
