const deptPages = [
    { dept: 'CSE', path: 'academics/cse/index.html' },
    { dept: 'ECE', path: 'academics/ece/index.html' },
    { dept: 'EEE', path: 'academics/eee/index.html' },
    { dept: 'IT', path: 'academics/it/index.html' },
    { dept: 'MECH', path: 'academics/mech/index.html' },
    { dept: 'CIVIL', path: 'academics/civil/index.html' }
];

const deptFullNames = {
    CSE: 'Computer Science and Engineering',
    ECE: 'Electronics and Communication Engineering',
    EEE: 'Electrical and Electronics Engineering',
    MECH: 'Mechanical Engineering',
    CIVIL: 'Civil Engineering',
    IT: 'Information Technology'
};

const subjectNameToCode = {};
const subjectCodeToInfo = {};
const subjectData = {};

function getParam(name) {
    const p = new URLSearchParams(window.location.search);
    return p.get(name) || '';
}

function normalizeSubjectName(str) {
    if (!str) return '';
    let s = String(str);
    s = s.replace(/\([^)]*\)/g, ' ');
    s = s.replace(/[–—-]/g, ' ');
    const romanMap = {
        'VIII': '8', 'VII': '7', 'VI': '6', 'V': '5', 'IV': '4', 'III': '3', 'II': '2', 'I': '1'
    };
    s = s.replace(/\b(VIII|VII|VI|IV|III|II|I)\b/gi, m => romanMap[m.toUpperCase()] || m);
    s = s.replace(/&/g, 'and');
    return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeRegulation(reg) {
    if (!reg) return '';
    const s = String(reg);
    const year = s.match(/(20\d{2})/);
    if (year) return year[1];
    const digits = s.replace(/\D/g, '');
    return digits || '';
}

function extractSubjectCodesFromHtml(html, dept) {
    try {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const cards = doc.querySelectorAll('.note-card');
        cards.forEach(card => {
            const text = (card.textContent || '').trim();
            const match = text.match(/^(.*)\(([^)]+)\)\s*$/);
            if (!match) return;
            const name = match[1].trim();
            let code = match[2].trim();
            if (!name || !code) return;
            code = code.replace(/\s+/g, '').toUpperCase();
            const normalized = normalizeSubjectName(name);
            if (!normalized) return;

            if (!subjectNameToCode[normalized]) subjectNameToCode[normalized] = code;
            if (!subjectCodeToInfo[code]) subjectCodeToInfo[code] = { name: name, depts: new Set() };
            subjectCodeToInfo[code].depts.add(dept);
            if (!subjectCodeToInfo[code].name) subjectCodeToInfo[code].name = name;
        });
    } catch (e) {
        console.warn('Subject code parse failed:', dept, e);
    }
}

async function loadSubjectCodeMaps() {
    const results = await Promise.allSettled(
        deptPages.map(page => fetch(page.path).then(r => r.text()).then(html => ({ dept: page.dept, html })))
    );
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            extractSubjectCodesFromHtml(result.value.html, result.value.dept);
        }
    });
}

function buildLongDescription(subjectName, code, regText, deptLabel, paperCount) {
    const regPart = regText ? ` If you follow ${regText}, this page aligns the papers with your regulation.` : '';
    return `The ${subjectName} (${code}) question paper page gives Anna University students a focused, year-wise archive for quick revision and exam practice. Each listed PDF is an official university paper so you can rehearse with authentic formats and marking patterns. The collection is grouped by exam year to help you track common topics and recurring question styles as the syllabus evolves.${regPart} Use the preview and download options to build a personal study set, compare yearly trends, and prepare for unit tests, model exams, and end semester assessments. New papers are added as they are released to keep your preparation current. Total papers available for this subject: ${paperCount}. Department reference: ${deptLabel}.`;
}

function setMeta(titleText, descriptionText, canonicalUrl) {
    document.title = titleText;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', descriptionText);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', canonicalUrl);
}

function dedupePapers(items) {
    const seen = new Set();
    return items.filter(item => {
        const key = item.pdf || item.title;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function collectPapersByYear(data, subjectNormalized) {
    const papers = [];
    const deptsWithPapers = new Set();
    const regsWithPapers = new Set();

    Object.keys(data || {}).forEach(dept => {
        const deptRegs = data[dept] || {};
        Object.entries(deptRegs).forEach(([reg, regData]) => {
            const normalizedReg = normalizeRegulation(reg);
            Object.entries(regData || {}).forEach(([sem, items]) => {
                Object.entries(items || {}).forEach(([name, list]) => {
                    if (normalizeSubjectName(name) === subjectNormalized) {
                        deptsWithPapers.add(dept);
                        if (normalizedReg) regsWithPapers.add(normalizedReg);
                        (list || []).forEach(paper => {
                            papers.push({
                                dept,
                                sem,
                                reg: normalizedReg || reg || '',
                                year: paper.year || 'Unknown',
                                title: paper.title || name,
                                pdf: paper.pdf || ''
                            });
                        });
                    }
                });
            });
        });
    });

    const unique = dedupePapers(papers);
    unique.sort((a, b) => Number(b.year) - Number(a.year));

    const grouped = {};
    unique.forEach(paper => {
        const year = paper.year || 'Unknown';
        if (!grouped[year]) grouped[year] = [];
        grouped[year].push(paper);
    });

    return { grouped, deptsWithPapers, regsWithPapers, count: unique.length };
}

function buildSubjectData(data) {
    Object.entries(subjectCodeToInfo || {}).forEach(([code, info]) => {
        if (!subjectData[code]) {
            const depts = info && info.depts ? Array.from(info.depts) : [];
            subjectData[code] = {
                code: code,
                name: (info && info.name) ? info.name : 'Subject',
                depts: new Set(depts),
                regs: new Set(),
                papers: []
            };
        }
    });

    Object.keys(data || {}).forEach(dept => {
        const deptRegs = data[dept] || {};
        Object.entries(deptRegs).forEach(([reg, regData]) => {
            const normalizedReg = normalizeRegulation(reg);
            Object.entries(regData || {}).forEach(([sem, items]) => {
                Object.entries(items || {}).forEach(([name, list]) => {
                    const normalizedName = normalizeSubjectName(name);
                    const code = subjectNameToCode[normalizedName];
                    if (!code) return;
                    if (!subjectData[code]) {
                        subjectData[code] = {
                            code: code,
                            name: name,
                            depts: new Set(),
                            regs: new Set(),
                            papers: []
                        };
                    }
                    subjectData[code].depts.add(dept);
                    if (normalizedReg) subjectData[code].regs.add(normalizedReg);
                    (list || []).forEach(paper => {
                        subjectData[code].papers.push({
                            dept,
                            sem,
                            reg: normalizedReg || reg || '',
                            year: paper.year || 'Unknown',
                            title: paper.title || name,
                            pdf: paper.pdf || ''
                        });
                    });
                });
            });
        });
    });
}

function renderPapers(grouped) {
    const container = document.getElementById('papersContainer');
    const emptyState = document.getElementById('emptyState');

    if (!grouped || Object.keys(grouped).length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    container.innerHTML = Object.keys(grouped).map(year => {
        const papers = grouped[year];
        const paperMarkup = papers.map(paper => {
            const safePdf = paper.pdf || '#';
            return `
                <div class="pyq-paper">
                    <div>
                        <div class="pyq-paper-title">${paper.title}</div>
                        <div class="pyq-paper-meta">Semester ${paper.sem} | ${paper.dept}${paper.reg ? ` | Reg ${paper.reg}` : ''}</div>
                    </div>
                    <div class="pyq-actions">
                        <a class="pyq-btn" href="${safePdf}" target="_blank" rel="noopener">View PDF</a>
                            <button class="pyq-btn primary pyq-download" type="button" data-url="${safePdf}" data-title="${paper.title}">Download</button>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="pyq-year">
                <h3>${year}</h3>
                ${paperMarkup}
            </div>
        `;
    }).join('');

    container.querySelectorAll('.pyq-download').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.getAttribute('data-url') || '';
            const title = btn.getAttribute('data-title') || 'paper';
            downloadPdf(url, title);
        });
    });
}

function downloadPdf(url, title) {
    try {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.download = (title || 'paper').replace(/\s+/g, '_') + '.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        window.open(url, '_blank');
    }
}

async function init() {
    const codeParam = getParam('code');
    const code = (codeParam || '').replace(/\s+/g, '').toUpperCase();

    document.getElementById('year').textContent = new Date().getFullYear();

    if (!code) {
        document.getElementById('subjectTitle').textContent = 'Subject code missing';
        document.getElementById('subjectDescription').textContent = 'Please open this page with a subject code, for example: pyq.html?code=CS3251.';
        document.getElementById('emptyState').classList.remove('hidden');
        return;
    }

    await loadSubjectCodeMaps();

    const response = await fetch('assets/data/qn.json');
    const data = await response.json();
    buildSubjectData(data);

    const subjectEntry = subjectData[code];
    if (!subjectEntry) {
        document.getElementById('subjectTitle').textContent = 'Subject not found';
        document.getElementById('subjectDescription').textContent = 'We could not find this subject code in the available records. Please check the code and try again.';
        document.getElementById('emptyState').classList.remove('hidden');
        return;
    }

    const subjectName = subjectEntry.name || 'Subject';
    const deptLabel = Array.from(subjectEntry.depts || []).map(d => deptFullNames[d] || d).join(', ') || 'Multiple Departments';
    const regText = subjectEntry.regs && subjectEntry.regs.size
        ? Array.from(subjectEntry.regs).join(', ')
        : '';

    const dedupedPapers = dedupePapers(subjectEntry.papers || []);
    const grouped = {};
    dedupedPapers.sort((a, b) => Number(b.year) - Number(a.year));
    dedupedPapers.forEach(paper => {
        const year = paper.year || 'Unknown';
        if (!grouped[year]) grouped[year] = [];
        grouped[year].push(paper);
    });

    const titleText = `${code} ${subjectName} Anna University Question Papers | LearnSkart`;
    const metaDescription = `${code} ${subjectName} question papers for Anna University. View and download year-wise PDFs with subject details and preparation notes.`;
    const canonicalUrl = `https://anand06-sk.github.io/Project-LearnSkart/pyq.html?code=${encodeURIComponent(code)}`;

    setMeta(titleText, metaDescription, canonicalUrl);

    document.getElementById('subjectTitle').textContent = `${subjectName} (${code}) Question Papers`;
    document.getElementById('subjectCode').textContent = `Code: ${code}`;
    document.getElementById('subjectDept').textContent = `Department: ${deptLabel || 'All Departments'}`;
    document.getElementById('subjectReg').textContent = regText ? `Regulation: ${regText}` : 'Regulation: Multiple';

    const regLabel = regText ? `Regulation ${regText}` : '';
    const longDescription = buildLongDescription(subjectName, code, regLabel, deptLabel || 'Multiple Departments', dedupedPapers.length);
    document.getElementById('subjectDescription').textContent = longDescription;

    if (subjectEntry.depts && subjectEntry.depts.size > 1) {
        const notice = document.getElementById('commonNotice');
        notice.textContent = `Note: ${code} is a common subject across multiple departments: ${deptLabel}.`;
        notice.classList.remove('hidden');
    }

    renderPapers(grouped);
}

init();
