const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, '..', 'assets', 'data', 'academics-templates.json');
const OUTPUT_ROOT = path.join(__dirname, '..', 'academics');
const BASE_URL = (process.env.BASE_URL || 'https://anand06-sk.github.io/Project-LearnSkart/').replace(/\/+$/, '');
const BASE_PATH = (process.env.BASE_PATH || '../index.html').replace(/\/+$/, '');

const DEPT_NAMES = {
  CSE: 'Computer Science and Engineering',
  ECE: 'Electronics and Communication Engineering',
  EEE: 'Electrical and Electronics Engineering',
  MECH: 'Mechanical Engineering',
  CIVIL: 'Civil Engineering',
  IT: 'Information Technology'
};

const DEPT_LIST = Object.keys(DEPT_NAMES).map(d => d.toLowerCase());

function normalizeSubjectName(str) {
  if (!str) return '';
  let s = String(str).toLowerCase();
  s = s.replace(/&/g, 'and');
  const romanMap = {
    'VIII': '8', 'VII': '7', 'VI': '6', 'V': '5', 'IV': '4', 'III': '3', 'II': '2', 'I': '1'
  };
  s = s.replace(/\b(VIII|VII|VI|V|IV|III|II|I)\b/gi, m => romanMap[m.toUpperCase()] || m);
  return s.replace(/[^a-z0-9]/g, '');
}

function extractCodeFromSlug(slug) {
  const m = String(slug || '').match(/^([a-z]{2,4}\d{3,4})/i);
  return m ? m[1].toUpperCase() : '';
}

function slugNamePart(slug) {
  const s = String(slug || '');
  const stripped = s.replace(/^[a-z]{2,4}\d{3,4}-?/i, '');
  return stripped.replace(/-/g, ' ').trim();
}

function buildExistingSlugMap() {
  const map = {};
  DEPT_LIST.forEach(dept => {
    const deptDir = path.join(OUTPUT_ROOT, dept);
    if (!fs.existsSync(deptDir)) return;
    const entries = fs.readdirSync(deptDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    map[dept] = entries.map(slug => {
      const namePart = slugNamePart(slug);
      return {
        slug,
        code: extractCodeFromSlug(slug),
        normalizedName: normalizeSubjectName(namePart)
      };
    });
  });
  return map;
}

function resolveExistingSlug(slugMap, deptLower, subjectName) {
  const list = slugMap[deptLower] || [];
  const target = normalizeSubjectName(subjectName);
  if (!target) return null;
  const exact = list.find(item => item.normalizedName === target);
  if (exact) return exact;
  const partial = list.find(item => item.normalizedName.includes(target) || target.includes(item.normalizedName));
  return partial || null;
}

function slugifySubjectName(str) {
  if (!str) return '';
  let s = String(str).toLowerCase().trim();
  s = s.replace(/[^a-z0-9]+/g, ' ');
  s = s.replace(/\s+/g, '-');
  return s.replace(/^-+|-+$/g, '');
}

function slugifyCode(code) {
  if (!code) return '';
  return String(code).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function toDrivePreview(url) {
  if (!url) return '';
  const match = String(url).match(/drive\.google\.com\/(?:uc\?id=|file\/d\/)([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return url;
}

function buildMetaDescription(entry) {
  const code = entry.subject_code ? entry.subject_code.toUpperCase() : 'Subject';
  const name = entry.subject_name || 'Subject';
  const deptName = entry.department_name || DEPT_NAMES[entry.department_code] || entry.department_code || 'Department';
  const sem = entry.semester ? `Semester ${entry.semester}` : 'Semester';
  const reg = entry.regulation ? `Regulation ${entry.regulation}` : 'Regulation';
  return `${code} ${name} notes for Anna University ${deptName}. ${sem} ${reg}. Download PDFs, study notes, and revision materials.`.replace(/\s+/g, ' ').trim();
}

function buildKeywords(entry) {
  const code = entry.subject_code || '';
  const name = entry.subject_name || 'Subject';
  const deptName = entry.department_name || DEPT_NAMES[entry.department_code] || entry.department_code || 'Department';
  const sem = entry.semester ? `semester ${entry.semester}` : 'semester';
  const reg = entry.regulation || 'regulation';
  return [
    name,
    code,
    deptName,
    sem,
    reg,
    'Anna University',
    'notes',
    'study materials',
    'PDF'
  ].filter(Boolean).join(', ');
}

function buildNotesCards(pdfs) {
  if (!Array.isArray(pdfs) || !pdfs.length) {
    return '<p>No notes PDFs are available for this subject yet.</p>';
  }

  const cards = pdfs.map(pdf => {
    const title = pdf.name || 'PDF Notes';
    const url = pdf.url || pdf.path || '#';
    const viewUrl = toDrivePreview(url);
    return [
      '<div class="note-card">',
      '  <div class="card-icon"><i class="fas fa-file-pdf"></i></div>',
      `  <h3>${title}</h3>`,
      '  <p>',
      `    <a href="${viewUrl}" target="_blank" rel="noopener">View</a> Â· `,
      `    <a href="${url}" target="_blank" rel="noopener" download>Download</a>`,
      '  </p>',
      '</div>'
    ].join('\n');
  }).join('\n');

  return `<div class="cards-row">\n${cards}\n</div>`;
}

function buildStudyMaterialButtons(entry, folderSlug, subjectCode) {
  const deptCode = (entry.department_code || '').toUpperCase();
  const sem = entry.semester || '';
  const reg = entry.regulation || '';
  const code = subjectCode || entry.subject_code || '';

  const syllabusHref = `/syllabus/index.html`;
  const pyqHref = code ? `/pyq/${code.toUpperCase()}/` : '#';

  const buttons = [];

  buttons.push(`    <a class="pyq-btn" href="${syllabusHref}" target="_blank" rel="noopener">View Syllabus</a>`);

  if (code) {
    buttons.push(`    <a class="pyq-btn primary" href="${pyqHref}" target="_blank" rel="noopener">View Question Papers</a>`);
  }

  return buttons.join('\n');
}

function buildBreadcrumb(deptLower, deptLabel, subjectName) {
  return [
    '<nav aria-label="Breadcrumb" style="margin: 1.5rem 0; font-size: 0.875rem; color: var(--muted);">',
    `  <a href="../index.html">Home</a> &gt; <a href="../academics/${deptLower}/index.html">${deptLabel}</a> &gt; <span>${subjectName}</span>`,
    '</nav>'
  ].join('\n');
}

function buildNotesPdfsList(pdfs) {
  if (!Array.isArray(pdfs) || !pdfs.length) {
    return '<p>No notes PDFs are available for this subject yet.</p>';
  }

  const items = pdfs.map(pdf => {
    const title = pdf.name || 'PDF Notes';
    const url = pdf.url || pdf.path || '#';
    const viewUrl = toDrivePreview(url);
    return [
      '<li class="pyq-paper">',
      '  <div class="pyq-paper-info">',
      `    <div class="pyq-paper-title">${title}</div>`,
      '  </div>',
      '  <div class="pyq-actions">',
      `    <a class="pyq-btn" href="${viewUrl}" target="_blank" rel="noopener">View</a>`,
      `    <a class="pyq-btn primary" href="${url}" target="_blank" rel="noopener" download>Download</a>`,
      '  </div>',
      '</li>'
    ].join('\n');
  }).join('\n');

  return [
    '<section class="pyq-list">',
    '<section class="pyq-year">',
    '<h2>Study Materials</h2>',
    '<ul>',
    items,
    '</ul>',
    '</section>',
    '</section>'
  ].join('\n');
}

function buildHtml(entry, canonicalUrl, folderSlug) {
  const deptCode = (entry.department_code || '').toUpperCase();
  const deptLower = deptCode.toLowerCase();
  const deptLabel = entry.department_name || DEPT_NAMES[deptCode] || deptCode || 'Department';
  const subjectName = entry.subject_name || 'Subject';
  const subjectCode = entry.subject_code ? entry.subject_code.toUpperCase() : '';
  const h1Text = subjectCode ? `${subjectCode} ${subjectName}` : subjectName;
  const titleText = subjectCode
    ? `${subjectCode} ${subjectName} Notes | ${deptLabel} | Anna University`
    : `${subjectName} Notes | ${deptLabel} | Anna University`;
  const metaDescription = entry.meta_description || buildMetaDescription(entry);
  const metaKeywords = entry.meta_keywords || buildKeywords(entry);
  const semLabel = entry.semester ? `Semester ${entry.semester}` : 'Semester';
  const regLabel = entry.regulation ? `Regulation ${entry.regulation}` : 'Regulation';
  const annaLine = `Anna University ${deptLabel} - ${semLabel} - ${regLabel}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titleText}</title>
    <meta name="description" content="${metaDescription}">
    <meta name="keywords" content="${metaKeywords}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${canonicalUrl}">
    <link rel="stylesheet" href="../assets/css/question.css">
    <link rel="stylesheet" href="../assets/css/pyq-static.css">
</head>
<body>
    <nav class="nav">
        <div class="container nav-inner">
            <div class="logo-wrap">
                <div class="logo-icon"><img src="../assets/icons/favicon-96x96.png" alt="LearnSkart Logo" class="logo-img"></div>
                <div class="logo-text">
                    <h1>LearnSkart</h1>
                    <p>Study Notes</p>
                </div>
            </div>
            <div class="nav-links">
                <a href="../index.html">Home</a>
                <a href="../academics/${deptLower}/index.html">${deptLabel}</a>
                <a href="../syllabus/index.html">Syllabus</a>
            </div>
        </div>
    </nav>

    <main class="main container">
        ${buildBreadcrumb(deptLower, deptLabel, subjectName)}

        <header class="content-header" style="align-items:flex-start;">
            <div>
                <h1 style="font-size:2rem; font-weight:800; margin-bottom:0.5rem;">${h1Text}</h1>
                <p style="color: var(--muted); max-width: 900px; line-height: 1.6;">Find Anna University ${subjectName} (${subjectCode}) study notes for ${deptLabel}. This page is aligned to regulation ${regLabel} - ${semLabel} and provides curated PDFs for exam preparation.</p>
            </div>
        </header>

        <section style="margin: 2rem 0;">
            <h2 style="margin-bottom:1rem;">Notes PDFs</h2>
            ${buildNotesPdfsList(entry.notes || [])}
        </section>

        <section style="margin: 2rem 0; display: flex; gap: 1rem; flex-wrap: wrap;">
            <h2 style="width: 100%; margin-bottom:1rem;">Additional Resources</h2>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
${buildStudyMaterialButtons(entry, folderSlug, subjectCode)}
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <div class="footer-logo"><img src="../assets/icons/favicon-96x96.png" alt="LearnSkart Logo" class="logo-img"> LearnSkart</div>
            <p style="color:var(--muted); font-size:0.875rem; margin-bottom:2rem;">Anna University study notes and materials, arranged for quick revision.</p>
            <div style="font-size:0.75rem; color:#94a3b8; text-align: center;">&copy; 2026 LearnSkart. All rights reserved.</div>
        </div>
    </footer>
    <script src="../assets/js/theme.js" defer></script>
</body>
</html>`;

  return html;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error('academics-templates.json not found. Run scripts/generate-academics-templates.js first.');
  process.exit(1);
}

const raw = fs.readFileSync(TEMPLATE_PATH, 'utf8').replace(/^\uFEFF/, '');
const templates = JSON.parse(raw);
const entries = Array.isArray(templates) ? templates : (templates.subjects || []);
const existingSlugMap = buildExistingSlugMap();

let written = 0;
entries.forEach(entry => {
  const deptCode = (entry.department_code || '').toUpperCase();
  const deptLower = deptCode.toLowerCase();
  if (!deptCode || !deptLower) return;

  const existing = resolveExistingSlug(existingSlugMap, deptLower, entry.subject_name || '');
  const inferredCode = existing?.code || entry.subject_code || '';
  const codeSlug = slugifyCode(inferredCode);
  const nameSlug = slugifySubjectName(entry.subject_name || '');
  const folderSlug = existing?.slug || (codeSlug ? `${codeSlug}-${nameSlug}` : nameSlug);
  if (!folderSlug) return;

  const canonicalUrl = `${BASE_URL}/academics/${deptLower}/${folderSlug}/`;
  const html = buildHtml({ ...entry, subject_code: inferredCode || entry.subject_code }, canonicalUrl, folderSlug);

  const outputDir = path.join(OUTPUT_ROOT, deptLower, folderSlug);
  ensureDir(outputDir);
  fs.writeFileSync(path.join(outputDir, 'index.html'), `${html}\n`, 'utf8');
  written += 1;
});

console.log(`Generated ${written} academic subject pages in ${OUTPUT_ROOT}`);

