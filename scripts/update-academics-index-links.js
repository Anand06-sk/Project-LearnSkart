const fs = require('fs');
const path = require('path');

const ACADEMICS_ROOT = path.join(__dirname, '..', 'academics');
const BASE_PATH = (process.env.BASE_PATH || '/Project-LearnSkart').replace(/\/+$/, '');
const DEPTS = ['cse', 'ece', 'eee', 'mech', 'civil', 'it'];

function slugifySubjectName(str) {
  if (!str) return '';
  let s = String(str).toLowerCase().trim();
  s = s.replace(/[^a-z0-9]+/g, ' ');
  s = s.replace(/\s+/g, '-');
  return s.replace(/^-+|-+$/g, '');
}

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
  DEPTS.forEach(dept => {
    const deptDir = path.join(ACADEMICS_ROOT, dept);
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

function resolveExistingSlug(slugMap, dept, subjectName) {
  const list = slugMap[dept] || [];
  const target = normalizeSubjectName(subjectName);
  if (!target) return null;
  const exact = list.find(item => item.normalizedName === target);
  if (exact) return exact;
  const partial = list.find(item => item.normalizedName.includes(target) || target.includes(item.normalizedName));
  return partial || null;
}

function buildHref(dept, subjectName, subjectCode) {
  const codeSlug = String(subjectCode || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const nameSlug = slugifySubjectName(subjectName || '');
  const folderSlug = codeSlug ? `${codeSlug}-${nameSlug}` : nameSlug;
  return `./${folderSlug}/`;
}

function subjectPageExists(dept, subjectName, subjectCode) {
  const codeSlug = String(subjectCode || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const nameSlug = slugifySubjectName(subjectName || '');
  const folderSlug = codeSlug ? `${codeSlug}-${nameSlug}` : nameSlug;
  const target = path.join(ACADEMICS_ROOT, dept, folderSlug, 'index.html');
  return fs.existsSync(target);
}

function resolveSubjectHref(slugMap, dept, subjectName, subjectCode) {
  const codeUpper = String(subjectCode || '').toUpperCase();
  if (codeUpper) {
    const list = slugMap[dept] || [];
    const byCode = list.find(item => item.code === codeUpper);
    if (byCode?.slug) {
      return `./${byCode.slug}/`;
    }
  }
  if (subjectPageExists(dept, subjectName, subjectCode)) {
    return buildHref(dept, subjectName, subjectCode);
  }
  const existing = resolveExistingSlug(slugMap, dept, subjectName);
  if (existing?.slug) {
    return `./${existing.slug}/`;
  }
  return '';
}

function parseLabel(label) {
  const text = String(label || '').trim();
  if (!text) return null;
  const codeMatch = text.match(/\(([^)]+)\)\s*$/);
  const subjectCode = codeMatch ? codeMatch[1].trim() : '';
  const subjectName = codeMatch ? text.replace(/\s*\([^)]+\)\s*$/, '').trim() : text;
  if (!subjectName) return null;
  return { label: text, subjectName, subjectCode };
}

function buildNoteCardAnchor(label, href) {
  return `<a class="note-card" href="${href}">${label}</a>`;
}

const existingSlugMap = buildExistingSlugMap();

function replaceNoteCards(html, dept) {
  let updated = html;

  updated = updated.replace(/<a\s+class="note-card"[^>]*>([^<]*)<\/a>/g, (match, text) => {
    const parsed = parseLabel(text);
    if (!parsed) return match;
    const href = resolveSubjectHref(existingSlugMap, dept, parsed.subjectName, parsed.subjectCode);
    if (!href) return match;
    return buildNoteCardAnchor(parsed.label, href);
  });

  updated = updated.replace(/<div\s+class="note-card">([^<]*)<\/div>/g, (match, text) => {
    const parsed = parseLabel(text);
    if (!parsed) return match;
    const href = resolveSubjectHref(existingSlugMap, dept, parsed.subjectName, parsed.subjectCode);
    if (!href) return match;
    return buildNoteCardAnchor(parsed.label, href);
  });

  return updated;
}

DEPTS.forEach(dept => {
  const filePath = path.join(ACADEMICS_ROOT, dept, 'index.html');
  if (!fs.existsSync(filePath)) return;
  const original = fs.readFileSync(filePath, 'utf8');
  const updated = replaceNoteCards(original, dept);
  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`Updated links in ${filePath}`);
  }
});
