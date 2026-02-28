const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, '..', 'assets', 'data', 'pyq-templates.json');
const OUTPUT_ROOT = path.join(__dirname, '..', 'pyq');
const BASE_URL = (process.env.BASE_URL || 'https://learnskart.in/').replace(/\/+$/, '');

function normalizeCode(code) {
  if (!code) return '';
  return String(code).replace(/\s+/g, '').toUpperCase();
}

function slugForCode(code) {
  return normalizeCode(code).replace(/[^A-Z0-9]/g, '');
}

function normalizeSubjectName(str) {
  if (!str) return '';
  let s = String(str);
  s = s.replace(/\([^)]*\)/g, ' ');
  s = s.replace(/[–—-]/g, ' ');
  s = s.replace(/&/g, 'and');
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function slugifySubjectName(str) {
  if (!str) return '';
  let s = String(str).toLowerCase().trim();
  s = s.replace(/[^a-z0-9\s]/g, '');
  s = s.replace(/\s+/g, '-');
  return s.replace(/^-+|-+$/g, '');
}

const SUBJECT_OVERRIDES = [
  {
    name: 'Microprocessor and Microcontroller',
    code: 'EE3453',
    department: 'Electrical and Electronics Engineering',
    department_codes: ['EEE']
  }
];

function applyOverrides(entry) {
  const normalizedName = normalizeSubjectName(entry.subject_name || '');
  const override = SUBJECT_OVERRIDES.find(item => normalizeSubjectName(item.name) === normalizedName);
  if (!override) return entry;

  return {
    ...entry,
    subject_code: override.code || entry.subject_code,
    department: override.department || entry.department,
    department_codes: override.department_codes || entry.department_codes
  };
}

function buildMetaDescription(entry) {
  const name = entry.subject_name || 'Subject';
  const code = normalizeCode(entry.subject_code) || 'UNKNOWN';
  const dept = entry.department || 'Multiple Departments';
  const reg = entry.regulations ? `Regulation: ${entry.regulations}. ` : '';
  return `${code} ${name} previous year question papers for Anna University. Department: ${dept}. ${reg}Download PDF papers and prepare with year-wise university questions.`.replace(/\s+/g, ' ').trim();
}

function ensureTag(html, regex, replacement, insertBefore = '</head>') {
  if (regex.test(html)) {
    return html.replace(regex, replacement);
  }
  const idx = html.indexOf(insertBefore);
  if (idx === -1) return `${html}\n${replacement}`;
  return `${html.slice(0, idx)}${replacement}\n${html.slice(idx)}`;
}

function ensureTitle(html, titleText) {
  return ensureTag(html, /<title>.*?<\/title>/i, `<title>${titleText}</title>`);
}

function ensureMeta(html, name, content) {
  const escapedName = name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`<meta\\s+name=\\"${escapedName}\\"\\s+content=\\".*?\\">`, 'i');
  const replacement = `<meta name="${name}" content="${content}">`;
  return ensureTag(html, regex, replacement);
}

function ensureCanonical(html, canonicalUrl) {
  const regex = /<link\s+rel=\"canonical\"\s+href=\".*?\">/i;
  const replacement = `<link rel="canonical" href="${canonicalUrl}">`;
  return ensureTag(html, regex, replacement);
}

function ensureStylesheet(html, href) {
  const escaped = href.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`<link\\s+rel=\\"stylesheet\\"\\s+href=\\"${escaped}\\">`, 'i');
  const replacement = `<link rel="stylesheet" href="${href}">`;
  return ensureTag(html, regex, replacement);
}

function ensureH1(html, h1Text) {
  const hasPageH1 = /<h1[^>]*>[^<]*Previous Year Question Papers[^<]*<\/h1>/i.test(html);
  if (hasPageH1) return html;
  const mainMatch = html.match(/<main[^>]*>/i);
  if (!mainMatch) return html;
  const insertAt = mainMatch.index + mainMatch[0].length;
  const h1Markup = `\n        <h1>${h1Text}</h1>`;
  return `${html.slice(0, insertAt)}${h1Markup}${html.slice(insertAt)}`;
}

function buildFallbackHtml(entry, canonicalUrl) {
  const code = normalizeCode(entry.subject_code) || 'UNKNOWN';
  const name = entry.subject_name || 'Subject';
  const title = `${code} ${name} Previous Year Question Papers | Anna University`;
  const description = buildMetaDescription(entry);
  const keywords = `${name}, ${code}, Anna University, previous year question papers, Anna University question papers, ${entry.department || 'Multiple Departments'}`;
  const intro = entry.intro || `Find Anna University ${name} (${code}) previous year question papers for ${entry.department || 'Multiple Departments'}.`;

  return `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>${title}</title>\n    <meta name="description" content="${description}">\n    <meta name="keywords" content="${keywords}">\n    <meta name="robots" content="index, follow">\n    <link rel="canonical" href="${canonicalUrl}">\n    <link rel="stylesheet" href="../assets/css/question.css">\n</head>\n<body>\n    <main class="main container">\n        <nav aria-label="Breadcrumb" style="margin: 1.5rem 0; font-size: 0.875rem; color: var(--muted);">\n            <a href="../index.html">Home</a> &gt; <span>${entry.department || 'Departments'}</span> &gt; <span>${name}</span>\n        </nav>\n        <h1>${code} ${name} Previous Year Question Papers</h1>\n        <p>${intro}</p>\n    </main>\n    <script src="../assets/js/theme.js" defer></script>\n</body>\n</html>`;
}

function enhancePdfList(html) {
  function buildViewUrl(url) {
    const match = String(url).match(/drive\.google\.com\/(?:uc\?id=|file\/d\/)([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
  }

  return html.replace(
    /<li><a href="([^"]+)"[^>]*>([^<]+)<\/a><\/li>/g,
    (_match, url, title) => {
      const viewUrl = buildViewUrl(url);
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
    }
  );
}

function ensureThemeScript(html) {
  // Add theme.js script before closing body tag if not already present
  if (html.includes('theme.js')) return html;
  const bodyCloseIdx = html.lastIndexOf('</body>');
  if (bodyCloseIdx === -1) return html;
  return html.slice(0, bodyCloseIdx) + '    <script src="../assets/js/theme.js" defer></script>\n' + html.slice(bodyCloseIdx);
}

function mergeEntry(target, incoming) {
  if (!target.subject_name && incoming.subject_name) target.subject_name = incoming.subject_name;
  if (!target.department && incoming.department) target.department = incoming.department;
  if (!target.regulations && incoming.regulations) target.regulations = incoming.regulations;
  if (!target.html && incoming.html) target.html = incoming.html;
  if (incoming.department_codes) {
    target.department_codes = Array.from(new Set([...(target.department_codes || []), ...incoming.department_codes]));
  }
  return target;
}

const raw = fs.readFileSync(TEMPLATE_PATH, 'utf8').replace(/^\uFEFF/, '');
const templates = JSON.parse(raw);

const merged = new Map();
(templates || []).forEach(entry => {
  const overridden = applyOverrides(entry);
  const code = normalizeCode(overridden.subject_code);
  if (!code) return;
  if (!merged.has(code)) {
    merged.set(code, { ...overridden, subject_code: code });
  } else {
    const existing = merged.get(code);
    merged.set(code, mergeEntry(existing, overridden));
  }
});

if (!fs.existsSync(OUTPUT_ROOT)) {
  fs.mkdirSync(OUTPUT_ROOT, { recursive: true });
}

let written = 0;
merged.forEach(entry => {
  const code = normalizeCode(entry.subject_code);
  const codeSlug = slugForCode(code);
  if (!codeSlug) return;

  const subjectSlug = slugifySubjectName(entry.subject_name || '');
  const folderSlug = subjectSlug ? `${codeSlug}-${subjectSlug}` : codeSlug;

  const canonicalUrl = `${BASE_URL}/pyq/${folderSlug}/`;
  let html = entry.html || '';

  if (!html) {
    html = buildFallbackHtml(entry, canonicalUrl);
  }

  const titleText = `${code} ${entry.subject_name || 'Subject'} Previous Year Question Papers | Anna University`;
  const metaDescription = entry.meta_description || buildMetaDescription(entry);
  const metaKeywords = entry.meta_keywords || `${entry.subject_name || 'Subject'}, ${code}, Anna University, previous year question papers, Anna University question papers, ${entry.department || 'Multiple Departments'}`;

  html = ensureTitle(html, titleText);
  html = ensureMeta(html, 'description', metaDescription);
  html = ensureMeta(html, 'keywords', metaKeywords);
  html = ensureMeta(html, 'robots', 'index, follow');
  html = ensureCanonical(html, canonicalUrl);
  html = ensureStylesheet(html, '../assets/css/pyq-static.css');
  html = ensureH1(html, `${code} ${entry.subject_name || 'Subject'} Previous Year Question Papers`);
  html = enhancePdfList(html);
  html = ensureThemeScript(html);

  const outputDir = path.join(OUTPUT_ROOT, folderSlug);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'index.html'), `${html}\n`, 'utf8');
  written += 1;
});

console.log(`Generated ${written} subject pages in ${OUTPUT_ROOT}`);
