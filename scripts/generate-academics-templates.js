const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'assets', 'data', 'data.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'assets', 'data', 'academics-templates.json');

const DEPT_NAMES = {
  CSE: 'Computer Science and Engineering',
  ECE: 'Electronics and Communication Engineering',
  EEE: 'Electrical and Electronics Engineering',
  MECH: 'Mechanical Engineering',
  CIVIL: 'Civil Engineering',
  IT: 'Information Technology'
};

const CODE_REGEX = /[A-Z]{2,4}\d{3,4}/g;

function extractCodesFromText(text, bucket) {
  if (!text) return;
  const matches = String(text).toUpperCase().match(CODE_REGEX) || [];
  matches.forEach(code => bucket.push(code));
}

function pickMostCommon(codes) {
  if (!codes.length) return '';
  const counts = new Map();
  codes.forEach(code => counts.set(code, (counts.get(code) || 0) + 1));
  let best = '';
  let bestCount = 0;
  counts.forEach((count, code) => {
    if (count > bestCount) {
      best = code;
      bestCount = count;
    }
  });
  return best;
}

function normalizePdfList(pdfs) {
  if (!Array.isArray(pdfs)) return [];
  return pdfs
    .filter(p => p && (p.url || p.path || p.name))
    .map(p => ({
      name: p.name || p.title || 'PDF Notes',
      url: p.url || p.path || ''
    }))
    .filter(p => p.url || p.name);
}

if (!fs.existsSync(DATA_PATH)) {
  console.error('data.json not found.');
  process.exit(1);
}

const raw = fs.readFileSync(DATA_PATH, 'utf8').replace(/^\uFEFF/, '');
const data = JSON.parse(raw);
const templates = [];

Object.entries(data || {}).forEach(([dept, deptData]) => {
  Object.entries(deptData || {}).forEach(([regulation, regs]) => {
    Object.entries(regs || {}).forEach(([semester, subjects]) => {
      Object.entries(subjects || {}).forEach(([subjectName, subjectData]) => {
        const pdfs = normalizePdfList(subjectData && subjectData.pdfs);

        const codes = [];
        extractCodesFromText(subjectName, codes);
        pdfs.forEach(pdf => {
          extractCodesFromText(pdf.name, codes);
          extractCodesFromText(pdf.url, codes);
        });

        const subjectCode = pickMostCommon(codes);
        templates.push({
          department_code: dept.toUpperCase(),
          department_name: DEPT_NAMES[dept.toUpperCase()] || dept,
          regulation: regulation,
          semester: semester,
          subject_name: subjectName,
          subject_code: subjectCode,
          notes: pdfs
        });
      });
    });
  });
});

templates.sort((a, b) => {
  const deptCompare = (a.department_code || '').localeCompare(b.department_code || '');
  if (deptCompare !== 0) return deptCompare;
  const regCompare = (a.regulation || '').localeCompare(b.regulation || '');
  if (regCompare !== 0) return regCompare;
  const semCompare = String(a.semester || '').localeCompare(String(b.semester || ''));
  if (semCompare !== 0) return semCompare;
  return (a.subject_code || '').localeCompare(b.subject_code || '');
});

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(templates, null, 2));
console.log(`Generated ${templates.length} templates at ${OUTPUT_PATH}`);
