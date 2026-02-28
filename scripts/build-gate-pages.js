const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const GATE_JS_PATH = path.join(ROOT, 'assets', 'js', 'gate.js');
const GATE_DATA_PATH = path.join(ROOT, 'assets', 'data', 'gate-qns.json');
const OUTPUT_ROOT = path.join(ROOT, 'gate');
const BASE_URL = (process.env.BASE_URL || 'https://learnskart.in').replace(/\/+$/, '');

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
}

function htmlEscape(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"../g, '&quot;')
    .replace(/'../g, '&#39;');
}

function normalizeSubjectName(name) {
  return String(name || '').replace(/\s+/g, ' ').trim();
}

function normalizePdfSubject(name) {
  const normalized = normalizeSubjectName(name);
  if (normalized === 'Textiles Engineering and Fibre Science') {
    return 'Textile Engineering and Fibre Science';
  }
  return normalized;
}

function slugifySubjectName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function buildSubjectPath(subject) {
  const code = String(subject.code || '').toLowerCase();
  const nameSlug = slugifySubjectName(subject.name || 'subject');
  return `${code}-${nameSlug}`;
}

function parseDriveId(url) {
  if (!url) return '';
  const text = String(url);
  const match = text.match(/\/d\/([^/]+)\//) || text.match(/[?&]id=([^&]+)/);
  return match ? match[1] : '';
}

function toPreviewUrl(url) {
  const id = parseDriveId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : url;
}

function toDownloadUrl(url) {
  const id = parseDriveId(url);
  return id ? `https://drive.google.com/uc?export=download&id=${id}` : url;
}

function extractBalancedLiteral(source, varName) {
  const marker = `const ${varName}`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) throw new Error(`Unable to find ${varName} in gate.js`);

  const equalIndex = source.indexOf('=', markerIndex);
  if (equalIndex === -1) throw new Error(`Unable to parse assignment for ${varName}`);

  let start = equalIndex + 1;
  while (start < source.length && /\s/.test(source[start])) start += 1;

  const open = source[start];
  const close = open === '[' ? ']' : open === '{' ? '}' : '';
  if (!close) throw new Error(`Unsupported literal for ${varName}`);

  let depth = 0;
  let inString = false;
  let quote = '';
  let escaped = false;

  for (let i = start; i < source.length; i += 1) {
    const char = source[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === quote) {
        inString = false;
        quote = '';
      }
      continue;
    }

    if (char === '"' || char === '\'' || char === '`') {
      inString = true;
      quote = char;
      continue;
    }

    if (char === open) depth += 1;
    if (char === close) {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }

  throw new Error(`Unbalanced literal while parsing ${varName}`);
}

function parseSubjectsFromGateJs() {
  const source = readText(GATE_JS_PATH);
  const subjectsLiteral = extractBalancedLiteral(source, 'subjects');
  const iconsLiteral = extractBalancedLiteral(source, 'subjectIcons');

  const subjects = vm.runInNewContext(`(${subjectsLiteral})`);
  const subjectIcons = vm.runInNewContext(`(${iconsLiteral})`);

  if (!Array.isArray(subjects)) {
    throw new Error('Parsed subjects is not an array');
  }

  return { subjects, subjectIcons };
}

function parseGatePdfData() {
  const rows = JSON.parse(readText(GATE_DATA_PATH));
  const bySubject = new Map();

  rows.forEach(item => {
    const subject = normalizePdfSubject(item.Subject);
    if (!subject) return;

    if (!bySubject.has(subject)) bySubject.set(subject, []);

    bySubject.get(subject).push({
      fileName: item['PDF File Name'] || 'GATE Paper',
      directLink: item['Direct PDF Link'] || ''
    });
  });

  bySubject.forEach((papers, subject) => {
    papers.sort((a, b) => {
      const yearA = (a.fileName.match(/\b(\d{4})\b/) || [])[1];
      const yearB = (b.fileName.match(/\b(\d{4})\b/) || [])[1];
      const numA = yearA ? Number(yearA) : 0;
      const numB = yearB ? Number(yearB) : 0;
      if (numA !== numB) return numB - numA;
      return a.fileName.localeCompare(b.fileName);
    });
  });

  return bySubject;
}

function groupByYear(papers) {
  const groups = new Map();
  papers.forEach(paper => {
    const yearMatch = paper.fileName.match(/\b(\d{4})\b/);
    const year = yearMatch ? yearMatch[1] : 'Other';
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(paper);
  });

  return [...groups.entries()].sort((a, b) => {
    if (a[0] === 'Other') return 1;
    if (b[0] === 'Other') return -1;
    return Number(b[0]) - Number(a[0]);
  });
}

function buildSubjectPage(subject, subjectIcons, papers) {
  const code = subject.code;
  const name = subject.name;
  const subjectPath = buildSubjectPath(subject);
  const icon = subjectIcons[code] || '📘';
  const titleCore = `${name} (${code})`;

  const groups = groupByYear(papers);
  const listMarkup = groups.length
    ? groups.map(([year, rows]) => `
      <section class="pyq-year">
        <h3>${htmlEscape(year)}</h3>
        <ul>
          ${rows.map(row => `
            <li class="pyq-paper">
              <div class="pyq-paper-info">
                <div class="pyq-paper-title">${htmlEscape(row.fileName)}</div>
              </div>
              <div class="pyq-actions">
                <a class="pyq-btn" href="${htmlEscape(toPreviewUrl(row.directLink))}" target="_blank" rel="noopener">View</a>
                <a class="pyq-btn primary" href="${htmlEscape(toDownloadUrl(row.directLink))}" target="_blank" rel="noopener">Download</a>
              </div>
            </li>`).join('')}
        </ul>
      </section>`).join('')
    : '<p class="empty-state-msg">PDFs are not available for this subject yet.</p>';

  const description = `${titleCore} GATE previous year question papers with direct PDF view and download links. Practice year-wise PYQs for better exam preparation.`;
  const keywords = `${name}, ${code}, GATE PYQ, GATE ${code} previous year questions, GATE ${code} PDF`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${htmlEscape(titleCore)} – GATE PYQ | LearnSkart</title>
  <meta name="description" content="${htmlEscape(description)}">
  <meta name="keywords" content="${htmlEscape(keywords)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${BASE_URL}/gate/${subjectPath}/">
  <link rel="icon" href="../assets/icons/favicon.ico" type="image/x-icon">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="../assets/css/question.css">
  <link rel="stylesheet" href="../assets/css/gate-static.css">
</head>
<body>
  <nav class="nav">
    <div class="container nav-inner">
      <div class="logo-wrap">
        <div class="logo-icon"><img src="../assets/icons/favicon-96x96.png" alt="LearnSkart Logo" class="logo-img"></div>
        <div class="logo-text"><h1>LearnSkart</h1><p>GATE Papers</p></div>
      </div>
      <div class="nav-links">
        <a href="../index.html">Home</a>
        <a href="../gate-pyqs/">GATE</a>
      </div>
    </div>
  </nav>

  <main class="main container gate-main">
    <nav aria-label="Breadcrumb" class="breadcrumb">
      <a href="../index.html">Home</a> &gt; <a href="../gate-pyqs/">GATE</a> &gt; <span>${htmlEscape(titleCore)}</span>
    </nav>

    <header class="content-header" style="align-items:flex-start;">
      <div>
        <h1 class="gate-page-title">${htmlEscape(titleCore)}</h1>
        <p class="gate-page-intro">${icon} GATE PYQs for ${htmlEscape(name)} (${htmlEscape(code)}). ${htmlEscape(subject.description || '')} Practice these previous year papers to improve speed and concept clarity.</p>
      </div>
    </header>

    <section class="pyq-list">
      <h2>GATE Previous Year Papers</h2>
      ${listMarkup}
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-logo"><img src="../assets/icons/favicon-96x96.png" alt="LearnSkart Logo" class="logo-img"> LearnSkart</div>
      <p style="color:var(--muted); font-size:0.875rem; margin-bottom:2rem;">GATE previous year papers organized subject-wise for quick preparation.</p>
      <div style="font-size:0.75rem; color:#94a3b8; text-align: center;">&copy; 2026 LearnSkart. All rights reserved.</div>
    </div>
  </footer>
  <script src="../assets/js/theme.js" defer></script>
</body>
</html>`;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function build() {
  const { subjects, subjectIcons } = parseSubjectsFromGateJs();
  const pdfBySubject = parseGatePdfData();

  ensureDir(OUTPUT_ROOT);

  // Remove old generated subject folders but keep root directory.
  fs.readdirSync(OUTPUT_ROOT, { withFileTypes: true }).forEach(entry => {
    if (entry.isDirectory()) {
      fs.rmSync(path.join(OUTPUT_ROOT, entry.name), { recursive: true, force: true });
    }
  });

  let pagesWritten = 0;
  subjects.forEach(subject => {
    const subjectPath = buildSubjectPath(subject);
    const subjectDir = path.join(OUTPUT_ROOT, subjectPath);
    ensureDir(subjectDir);

    const papers = pdfBySubject.get(normalizeSubjectName(subject.name))
      || pdfBySubject.get(normalizePdfSubject(subject.name))
      || [];

    const subjectHtml = buildSubjectPage(subject, subjectIcons, papers);
    fs.writeFileSync(path.join(subjectDir, 'index.html'), `${subjectHtml}\n`, 'utf8');
    pagesWritten += 1;
  });

  console.log(`Generated ${pagesWritten} GATE static pages in ${OUTPUT_ROOT}`);
}

build();
