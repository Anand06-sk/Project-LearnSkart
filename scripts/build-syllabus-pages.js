const fs = require('fs');
const path = require('path');

const SYDATA_PATH = path.join(__dirname, '..', 'assets', 'data', 'sydata.json');
const ACADEMICS_ROOT = path.join(__dirname, '..', 'academics');
const OUTPUT_ROOT = path.join(__dirname, '..', 'syllabus');
const BASE_URL = (process.env.BASE_URL || 'https://learnskart.in').replace(/\/+$/, '');
const DEFAULT_REG = String(process.env.SYLLABUS_REG || '2021');

const DEPT_NAMES = {
  CSE: 'Computer Science and Engineering',
  ECE: 'Electronics and Communication Engineering',
  EEE: 'Electrical and Electronics Engineering',
  MECH: 'Mechanical Engineering',
  CIVIL: 'Civil Engineering',
  IT: 'Information Technology'
};

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}

function toDrivePreview(url) {
  if (!url) return '';
  const match = String(url).match(/drive\.google\.com\/(?:uc\?id=|file\/d\/)([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return url;
}

function normalizeText(input) {
  if (!input) return '';
  let s = String(input);
  s = s.replace(/\u2013|\u2014|\u2212/g, '-');
  s = s.replace(/&amp;/g, '&');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

function extractCodeFromText(text) {
  const match = String(text).match(/\(([A-Za-z]{2,4}\d{3,4})\)/);
  return match ? match[1].toUpperCase() : '';
}

function extractCodeFromSlug(slug) {
  const match = String(slug).match(/^([a-z]{2,4}\d{3,4})/i);
  return match ? match[1].toUpperCase() : '';
}

function sanitizeName(text, code) {
  let s = normalizeText(text);
  if (code) {
    const codePattern = new RegExp(`\\(${code}\\)`, 'i');
    s = s.replace(codePattern, '').trim();
  }
  s = s.replace(/\([^)]*\)/g, '').trim();
  return s;
}

function slugFromHref(href) {
  if (!href) return '';
  let cleaned = String(href).split('?')[0].split('#')[0];
  cleaned = cleaned.replace(/index\.html$/i, '');
  cleaned = cleaned.replace(/^\.+\//, '');
  cleaned = cleaned.replace(/\/+$/, '');
  const parts = cleaned.split('../index.html').filter(Boolean);
  return parts[parts.length - 1] || '';
}

function parseAcademicsSubjects(html) {
  const reg2021BlockMatch = String(html).match(/<div class="content-area" id="content-2021">([\s\S]*?)<div class="content-area" id="content-2025"../i);
  const sourceHtml = reg2021BlockMatch ? reg2021BlockMatch[1] : String(html);
  const semesters = {};
  const sectionRegex = /<div class="section"[^>]*id="semester-(\d+)"[\s\S]*?<div class="cards-row">([\s\S]*?)<\/div>/gi;
  let sectionMatch;

  while ((sectionMatch = sectionRegex.exec(sourceHtml)) !== null) {
    const sem = sectionMatch[1];
    const cards = sectionMatch[2];
    const subjects = [];
    const seen = new Set();
    const linkRegex = /<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
    let linkMatch;

    while ((linkMatch = linkRegex.exec(cards)) !== null) {
      const href = linkMatch[1];
      const rawText = linkMatch[2];
      const slug = slugFromHref(href);
      const codeFromText = extractCodeFromText(rawText);
      const codeFromSlug = extractCodeFromSlug(slug);
      const code = codeFromText || codeFromSlug;
      const name = sanitizeName(rawText, code);

      if (!slug || !name) continue;
      const key = `${slug}|${code}|${name}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      subjects.push({
        semester: sem,
        slug,
        code,
        name
      });
    }

    if (subjects.length && !semesters[sem]) {
      semesters[sem] = subjects;
    }
  }

  return semesters;
}

function buildButton(label, href, isPrimary) {
  if (!href) {
    return `<span class="pyq-btn${isPrimary ? ' primary' : ''} disabled">${label}</span>`;
  }
  return `<a class="pyq-btn${isPrimary ? ' primary' : ''}" href="${href}" target="_blank" rel="noopener">${label}</a>`;
}

function buildDeptPage(options) {
  const {
    deptCode,
    deptName,
    deptLower,
    reg,
    regData,
    subjectsBySem
  } = options;

  const canonicalUrl = `${BASE_URL}/syllabus/${deptLower}/`;
  const title = `${deptName} Syllabus | Anna University`;
  const description = `${deptName} syllabus PDFs for Anna University. Browse semester-wise syllabus and subject pages with direct PDF access.`;
  const keywords = `${deptName}, Anna University syllabus, ${deptCode}, semester syllabus, PDF`;

  const wholePdf = regData && regData.whole ? regData.whole.pdf : '';
  const wholeView = toDrivePreview(wholePdf);

  const semesterCards = Object.keys((regData && regData.semesters) || {})
    .sort((a, b) => Number(a) - Number(b))
    .map(sem => {
      const entry = Array.isArray(regData.semesters[sem]) ? regData.semesters[sem][0] : null;
      const pdf = entry ? entry.pdf : '';
      const view = toDrivePreview(pdf);
      const viewBtn = buildButton('View', view, false);
      const dlBtn = buildButton('Download', pdf, true);
      return [
        '<article class="syllabus-card">',
        `  <div class="card-meta">Semester ${sem}</div>`,
        '  <div class="card-title"><i class="fas fa-file-pdf"></i> Semester Syllabus PDF</div>',
        `  <div class="card-sub">${deptCode} - Regulation ${reg}</div>`,
        '  <div class="syllabus-actions">',
        `    ${viewBtn}`,
        `    ${dlBtn}`,
        '  </div>',
        '</article>'
      ].join('\n');
    })
    .join('\n');

  const subjectSections = Object.keys(subjectsBySem || {})
    .sort((a, b) => Number(a) - Number(b))
    .map(sem => {
      const subjectLinks = subjectsBySem[sem]
        .map(subject => {
          const codeBadge = subject.code
            ? `<span class="subject-code">${subject.code}</span>`
            : '';
          return [
            `<a class="subject-card" href="../syllabus/${deptLower}/${subject.slug}/">`,
            `  <div class="subject-title">${subject.name}</div>`,
            `  ${codeBadge}`,
            '</a>'
          ].join('\n');
        })
        .join('\n');

      return [
        '<section class="syllabus-section">',
        `  <h3>Semester ${sem} Subjects</h3>`,
        `  <div class="subject-grid">${subjectLinks}</div>`,
        '</section>'
      ].join('\n');
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="${keywords}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="icon" href="../assets/icons/favicon.ico" type="image/x-icon">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="../assets/css/question.css">
  <link rel="stylesheet" href="../assets/css/pyq-static.css">
  <link rel="stylesheet" href="../assets/css/syllabus-static.css">
</head>
<body>
  <nav class="nav">
    <div class="container nav-inner">
      <div class="logo-wrap">
        <div class="logo-icon"><img src="../assets/icons/favicon-96x96.png" alt="LearnSkart Logo" class="logo-img"></div>
        <div class="logo-text">
          <h1>LearnSkart</h1>
          <p>Syllabus</p>
        </div>
      </div>
      <div class="mobile-top-links">
        <a href="../index.html">Home</a>
        <a href="../syllabus/index.html">Dept Syllabus</a>
      </div>
      <div class="nav-links">
        <a href="../index.html">Home</a>
        <a href="../syllabus/">Syllabus Home</a>
        <a href="../academics/${deptLower}/index.html">${deptName}</a>
      </div>
    </div>
  </nav>

  <main class="main container">
    <nav aria-label="Breadcrumb">
      <a href="../index.html">Home</a> &gt; <a href="../syllabus/">Syllabus</a> &gt; <span>${deptName}</span>
    </nav>

    <header class="syllabus-hero">
      <div>
        <h1>${deptName} Syllabus</h1>
        <p>Find semester-wise Anna University syllabus PDFs and subject pages for ${deptName}. Use the cards below to view or download the latest syllabus.</p>
        <div class="hero-meta">Regulation ${reg} - ${deptCode}</div>
      </div>
      <div class="hero-card">
        <div class="hero-card-title"><i class="fas fa-book"></i> Whole Syllabus PDF</div>
        <div class="hero-card-sub">Complete regulation ${reg} syllabus</div>
        <div class="syllabus-actions">
          ${buildButton('View', wholeView, false)}
          ${buildButton('Download', wholePdf, true)}
        </div>
      </div>
    </header>

    <section class="syllabus-section">
      <h2>Semester-wise Syllabus PDFs</h2>
      <div class="syllabus-grid">
        ${semesterCards}
      </div>
    </section>

    <section class="syllabus-section">
      <h2>Subject Syllabus Pages</h2>
      ${subjectSections}
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-logo"><img src="../assets/icons/favicon-96x96.png" alt="LearnSkart Logo" class="logo-img"> LearnSkart</div>
      <p style="color:var(--muted); font-size:0.875rem; margin-bottom:2rem;">Anna University syllabus PDFs arranged by department and semester.</p>
      <div style="font-size:0.75rem; color:#94a3b8; text-align: center;">&copy; 2026 LearnSkart. All rights reserved.</div>
    </div>
  </footer>
  <script src="../assets/js/theme.js" defer></script>
</body>
</html>`;
}

function buildSubjectPage(options) {
  const {
    deptCode,
    deptName,
    deptLower,
    reg,
    semester,
    subject
  } = options;

  const codeLabel = subject.code ? `${subject.code} ` : '';
  const pageTitle = `${codeLabel}${subject.name} Syllabus | ${deptName} | Anna University`;
  const canonicalUrl = `${BASE_URL}/syllabus/${deptLower}/${subject.slug}/`;
  const description = `${codeLabel}${subject.name} syllabus for Anna University ${deptName}. Semester ${semester}, Regulation ${reg}. View and download the syllabus PDF.`.replace(/\s+/g, ' ');
  const keywords = `${subject.name}, ${subject.code || ''}, ${deptName}, semester ${semester}, regulation ${reg}, Anna University syllabus`.replace(/\s+/g, ' ').trim();

  const pdf = subject.semesterPdf || '';
  const view = toDrivePreview(pdf);
  const viewBtn = buildButton('View Syllabus', view, false);
  const dlBtn = buildButton('Download Syllabus', pdf, true);

  const wholePdf = subject.wholePdf || '';
  const wholeView = toDrivePreview(wholePdf);

  const wholeCard = wholePdf
    ? [
        '<article class="syllabus-card">',
        '  <div class="card-meta">Complete syllabus</div>',
        '  <div class="card-title"><i class="fas fa-book"></i> Whole Syllabus PDF</div>',
        `  <div class="card-sub">${deptCode} - Regulation ${reg}</div>`,
        '  <div class="syllabus-actions">',
        `    ${buildButton('View', wholeView, false)}`,
        `    ${buildButton('Download', wholePdf, true)}`,
        '  </div>',
        '</article>'
      ].join('\n')
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="${keywords}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="icon" href="../assets/icons/favicon.ico" type="image/x-icon">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="../assets/css/question.css">
  <link rel="stylesheet" href="../assets/css/pyq-static.css">
  <link rel="stylesheet" href="../assets/css/syllabus-static.css">
</head>
<body>
  <nav class="nav">
    <div class="container nav-inner">
      <div class="logo-wrap">
        <div class="logo-icon"><img src="../assets/icons/favicon-96x96.png" alt="LearnSkart Logo" class="logo-img"></div>
        <div class="logo-text">
          <h1>LearnSkart</h1>
          <p>Syllabus</p>
        </div>
      </div>
      <div class="mobile-top-links">
        <a href="../index.html">Home</a>
        <a href="../syllabus/index.html">Dept Syllabus</a>
      </div>
      <div class="nav-links">
        <a href="../index.html">Home</a>
        <a href="../syllabus/">Syllabus Home</a>
        <a href="../syllabus/${deptLower}/">${deptName}</a>
      </div>
    </div>
  </nav>

  <main class="main container">
    <nav aria-label="Breadcrumb">
      <a href="../index.html">Home</a> &gt; <a href="../syllabus/">Syllabus</a> &gt; <a href="../syllabus/${deptLower}/">${deptName}</a> &gt; <span>${subject.name}</span>
    </nav>

    <header class="content-header" style="align-items:flex-start;">
      <div>
        <h1 style="font-size:2rem; font-weight:800; margin-bottom:0.5rem;">${codeLabel}${subject.name} Syllabus</h1>
        <p style="color: var(--muted); max-width: 900px; line-height: 1.6;">Access the Anna University syllabus PDF for ${subject.name}. This subject belongs to ${deptName} semester ${semester}, regulation ${reg}.</p>
      </div>
    </header>

    <section class="syllabus-grid">
      <article class="syllabus-card">
        <div class="card-meta">Semester ${semester}</div>
        <div class="card-title"><i class="fas fa-file-pdf"></i> Semester Syllabus PDF</div>
        <div class="card-sub">${deptCode} - Regulation ${reg}</div>
        <div class="syllabus-actions">
          ${viewBtn}
          ${dlBtn}
        </div>
      </article>
      ${wholeCard}
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-logo"><img src="../assets/icons/favicon-96x96.png" alt="LearnSkart Logo" class="logo-img"> LearnSkart</div>
      <p style="color:var(--muted); font-size:0.875rem; margin-bottom:2rem;">Anna University syllabus PDFs arranged by department and semester.</p>
      <div style="font-size:0.75rem; color:#94a3b8; text-align: center;">&copy; 2026 LearnSkart. All rights reserved.</div>
    </div>
  </footer>
  <script src="../assets/js/theme.js" defer></script>
</body>
</html>`;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function build() {
  const sydata = readJson(SYDATA_PATH);
  const deptCodes = Object.keys(sydata || {});
  let written = 0;

  deptCodes.forEach(deptCode => {
    const deptLower = deptCode.toLowerCase();
    const deptName = DEPT_NAMES[deptCode] || deptCode;
    const regData = sydata[deptCode] && sydata[deptCode][DEFAULT_REG];
    if (!regData) return;

    const academicsPath = path.join(ACADEMICS_ROOT, deptLower, 'index.html');
    if (!fs.existsSync(academicsPath)) return;

    const academicsHtml = fs.readFileSync(academicsPath, 'utf8');
    const subjectsBySem = parseAcademicsSubjects(academicsHtml);

    const deptHtml = buildDeptPage({
      deptCode,
      deptName,
      deptLower,
      reg: DEFAULT_REG,
      regData,
      subjectsBySem
    });

    const deptDir = path.join(OUTPUT_ROOT, deptLower);
    ensureDir(deptDir);
    fs.writeFileSync(path.join(deptDir, 'index.html'), `${deptHtml}\n`, 'utf8');
    written += 1;

    Object.keys(subjectsBySem).forEach(sem => {
      subjectsBySem[sem].forEach(subject => {
        const outputDir = path.join(deptDir, subject.slug);
        ensureDir(outputDir);
        const semesterEntry = Array.isArray(regData.semesters && regData.semesters[sem])
          ? regData.semesters[sem][0]
          : null;
        const semesterPdf = semesterEntry ? semesterEntry.pdf : '';
        const wholePdf = regData.whole ? regData.whole.pdf : '';

        const subjectHtml = buildSubjectPage({
          deptCode,
          deptName,
          deptLower,
          reg: DEFAULT_REG,
          semester: sem,
          subject: {
            ...subject,
            semesterPdf,
            wholePdf
          }
        });

        fs.writeFileSync(path.join(outputDir, 'index.html'), `${subjectHtml}\n`, 'utf8');
        written += 1;
      });
    });
  });

  console.log(`Generated ${written} syllabus pages.`);
}

build();
