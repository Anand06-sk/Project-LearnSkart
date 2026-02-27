const fs = require('fs');
const path = require('path');

const qnPath = path.join(__dirname, '..', 'assets', 'data', 'qn.json');
const outPath = path.join(__dirname, '..', 'assets', 'data', 'pyq-templates.json');

const BASE_URL = 'https://anand06-sk.github.io/Project-LearnSkart';

const deptFullNames = {
  CSE: 'Computer Science and Engineering',
  ECE: 'Electronics and Communication Engineering',
  EEE: 'Electrical and Electronics Engineering',
  MECH: 'Mechanical Engineering',
  CIVIL: 'Civil Engineering',
  IT: 'Information Technology'
};

function normalizeSubjectName(str) {
  if (!str) return '';
  let s = String(str);
  s = s.replace(/\([^)]*\)/g, ' ');
  s = s.replace(/[–—-]/g, ' ');
  const romanMap = {
    VIII: '8', VII: '7', VI: '6', V: '5', IV: '4', III: '3', II: '2', I: '1'
  };
  s = s.replace(/\b(VIII|VII|VI|IV|III|II|I)\b/gi, m => romanMap[m.toUpperCase()] || m);
  s = s.replace(/&/g, 'and');
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function extractCodeFromText(text) {
  if (!text) return '';
  const match = String(text).match(/\b([A-Z]{2,4})\s*([0-9]{3,4})\b/);
  if (!match) return '';
  return `${match[1]}${match[2]}`.toUpperCase();
}

function pickMostFrequent(items) {
  const counts = new Map();
  items.forEach(item => {
    if (!item) return;
    counts.set(item, (counts.get(item) || 0) + 1);
  });
  let best = '';
  let bestCount = 0;
  counts.forEach((count, item) => {
    if (count > bestCount) {
      best = item;
      bestCount = count;
    }
  });
  return best;
}

function slugifyCode(code) {
  return String(code || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function slugifySubjectName(str) {
  if (!str) return '';
  let s = String(str).toLowerCase().trim();
  s = s.replace(/[^a-z0-9\s]/g, '');
  s = s.replace(/\s+/g, '-');
  return s.replace(/^-+|-+$/g, '');
}

function buildMetaDescription(name, code, deptLabel, regLabel) {
  const deptPart = deptLabel ? `Department: ${deptLabel}.` : '';
  const regPart = regLabel ? `Regulation: ${regLabel}.` : '';
  return `${code} ${name} previous year question papers for Anna University. ${deptPart} ${regPart} Download PDF papers and prepare with year-wise university questions.`.replace(/\s+/g, ' ').trim();
}

function groupByYear(papers) {
  const grouped = {};
  papers.forEach(paper => {
    const year = paper.year || 'Unknown';
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(paper);
  });
  return grouped;
}

function dedupePapers(papers) {
  const seen = new Set();
  return papers.filter(paper => {
    const key = `${paper.pdf || ''}::${paper.title || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildPdfList(grouped) {
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));
  return years.map(year => {
    const items = grouped[year].map(paper => {
      const title = paper.title || `${year} Question Paper`;
      const url = paper.pdf || '#';
      return `            <li><a href=\"${url}\" rel=\"noopener\" target=\"_blank\">${title}</a></li>`;
    }).join('\n');
    return `        <section class=\"pyq-year\">\n            <h2>${year}</h2>\n            <ul>\n${items}\n            </ul>\n        </section>`;
  }).join('\n');
}

function buildTemplate(entry) {
  const code = entry.subject_code || 'UNKNOWN';
  const name = entry.subject_name || 'Subject';
  const deptLabel = entry.department || 'Multiple Departments';
  const regLabel = entry.regulations || '';
  const codeSlug = slugifyCode(code || name);
  const nameSlug = slugifySubjectName(name);
  const folderSlug = nameSlug ? `${codeSlug}-${nameSlug}` : codeSlug;
  const canonical = `${BASE_URL}/pyq/${folderSlug}/`;

  const title = `${code} ${name} Previous Year Question Papers | Anna University`;
  const metaDescription = buildMetaDescription(name, code, deptLabel, regLabel);
  const keywords = `${name}, ${code}, Anna University, previous year question papers, Anna University question papers, ${deptLabel}`;
  const intro = `Find Anna University ${name} (${code}) previous year question papers for ${deptLabel}. This page is aligned to regulation ${regLabel || 'multiple regulations'} and provides year-wise PDFs for exam preparation.`;

  const grouped = groupByYear(dedupePapers(entry.papers || []));
  const pdfList = buildPdfList(grouped);

  const deptLinks = (entry.department_codes || []).map(dept => {
    const href = `/academics/${dept.toLowerCase()}/index.html`;
    const label = deptFullNames[dept] || dept;
    return `<a href=\"${href}\">${label}</a>`;
  }).join(' / ');

  return `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>${title}</title>\n    <meta name=\"description\" content=\"${metaDescription}\">\n    <meta name=\"keywords\" content=\"${keywords}\">\n    <meta name=\"robots\" content=\"index, follow\">\n    <link rel=\"canonical\" href=\"${canonical}\">\n    <link rel=\"stylesheet\" href=\"../assets/css/question.css\">\n</head>\n<body>\n    <nav class=\"nav\">\n        <div class=\"container nav-inner\">\n            <div class=\"logo-wrap\">\n                <div class=\"logo-icon\"><img src=\"../assets/icons/favicon-96x96.png\" alt=\"LearnSkart Logo\" class=\"logo-img\"></div>\n                <div class=\"logo-text\">\n                    <h1>LearnSkart</h1>\n                    <p>Question Papers</p>\n                </div>\n            </div>\n            <div class=\"nav-links\">\n                <a href=\"../\">Home</a>\n                <a href=\"../previous-year-questions/index.html\">All PYQs</a>\n            </div>\n        </div>\n    </nav>\n\n    <main class=\"main container\">\n        <nav aria-label=\"Breadcrumb\" style=\"margin: 1.5rem 0; font-size: 0.875rem; color: var(--muted);\">\n            <a href=\"../\">Home</a> &gt; ${deptLinks || 'Departments'} &gt; <span>${name}</span>\n        </nav>\n\n        <header class=\"content-header\" style=\"align-items:flex-start;\">\n            <div>\n                <h1 style=\"font-size:2rem; font-weight:800; margin-bottom:0.5rem;\">${code} ${name} Previous Year Question Papers</h1>\n                <p style=\"color: var(--muted); max-width: 900px; line-height: 1.6;\">${intro}</p>\n            </div>\n        </header>\n\n        <section class=\"pyq-list\">\n${pdfList}\n        </section>\n    </main>\n\n    <footer class=\"footer\">\n        <div class=\"container\">\n            <div class=\"footer-logo\"><img src=\"../assets/icons/favicon-96x96.png\" alt=\"LearnSkart Logo\" class=\"logo-img\"> LearnSkart</div>\n            <p style=\"color:var(--muted); font-size:0.875rem; margin-bottom:2rem;\">Anna University previous year question papers, arranged for quick revision.</p>\n            <div style=\"font-size:0.75rem; color:#94a3b8; text-align: center;\">&copy; ${new Date().getFullYear()} LearnSkart. All rights reserved.</div>\n        </div>\n    </footer>\n    <script src=\"../assets/js/theme.js\" defer></script>\n</body>\n</html>`;
}

const raw = fs.readFileSync(qnPath, 'utf8');
const cleaned = raw.replace(/^\uFEFF/, '');
const data = JSON.parse(cleaned);

const subjects = new Map();

Object.keys(data || {}).forEach(dept => {
  const deptRegs = data[dept] || {};
  Object.entries(deptRegs).forEach(([reg, regData]) => {
    Object.entries(regData || {}).forEach(([sem, items]) => {
      Object.entries(items || {}).forEach(([name, list]) => {
        const normalized = normalizeSubjectName(name);
        const codeCandidates = (list || []).map(p => extractCodeFromText(p.title || '')).filter(Boolean);
        const code = pickMostFrequent(codeCandidates) || '';
        const key = code ? code : normalized;
        if (!subjects.has(key)) {
          subjects.set(key, {
            subject_code: code || '',
            subject_name: name,
            department_codes: new Set([dept]),
            regulations: new Set([reg]),
            papers: []
          });
        }
        const entry = subjects.get(key);
        if (!entry.subject_name && name) entry.subject_name = name;
        if (!entry.subject_code && code) entry.subject_code = code;
        entry.department_codes.add(dept);
        entry.regulations.add(reg);
        (list || []).forEach(paper => {
          entry.papers.push({
            dept,
            sem,
            reg,
            year: paper.year || 'Unknown',
            title: paper.title || name,
            pdf: paper.pdf || ''
          });
        });
      });
    });
  });
});

const templates = [];
subjects.forEach(entry => {
  const deptCodes = Array.from(entry.department_codes || []);
  const deptLabel = deptCodes.map(code => deptFullNames[code] || code).join(', ');
  const regLabel = Array.from(entry.regulations || []).join(', ');
  const subjectCode = entry.subject_code || 'UNKNOWN';

  const templateEntry = {
    subject_code: subjectCode,
    subject_name: entry.subject_name || 'Subject',
    department: deptLabel || 'Multiple Departments',
    department_codes: deptCodes,
    regulations: regLabel,
    html: ''
  };

  templateEntry.html = buildTemplate({
    subject_code: templateEntry.subject_code,
    subject_name: templateEntry.subject_name,
    department: templateEntry.department,
    department_codes: templateEntry.department_codes,
    regulations: templateEntry.regulations,
    papers: entry.papers
  });

  templates.push(templateEntry);
});

templates.sort((a, b) => a.subject_code.localeCompare(b.subject_code));

fs.writeFileSync(outPath, JSON.stringify(templates, null, 2));
console.log(`Generated ${templates.length} templates at ${outPath}`);
