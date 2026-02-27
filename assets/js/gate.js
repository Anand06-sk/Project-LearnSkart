// Theme init for early dark mode state on this page.
(function () {
    try {
        var theme = localStorage.getItem('site-theme') || 'light';
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark-mode');
        }
    } catch (e) {
    }
})();

// Complete GATE Subjects Data
const subjects = [
    {
        name: 'Computer Science and Information Technology',
        code: 'CS',
        stream: 'Engineering',
        description: 'Covers algorithms, data structures, databases, operating systems, and computer networks.',
        papers: 15,
        difficulty: 'Medium-High'
    },
    {
        name: 'Mechanical Engineering',
        code: 'ME',
        stream: 'Engineering',
        description: 'Includes thermodynamics, fluid mechanics, strength of materials, and machine design.',
        papers: 14,
        difficulty: 'Medium'
    },
    {
        name: 'Electrical Engineering',
        code: 'EE',
        stream: 'Engineering',
        description: 'Covers circuits, electromagnetics, signals, and power systems.',
        papers: 14,
        difficulty: 'Medium'
    },
    {
        name: 'Electronics and Communication Engineering',
        code: 'EC',
        stream: 'Engineering',
        description: 'Includes analog circuits, digital electronics, communications, and signal processing.',
        papers: 14,
        difficulty: 'Medium'
    },
    {
        name: 'Civil Engineering',
        code: 'CE',
        stream: 'Engineering',
        description: 'Covers structural analysis, RCC design, geotechnical engineering, and water resources.',
        papers: 14,
        difficulty: 'Medium'
    },
    {
        name: 'Mathematics',
        code: 'MA',
        stream: 'Science',
        description: 'Real analysis, linear algebra, complex analysis, and differential equations.',
        papers: 10,
        difficulty: 'High'
    },
    {
        name: 'Physics',
        code: 'PH',
        stream: 'Science',
        description: 'Classical mechanics, quantum mechanics, thermodynamics, and optics.',
        papers: 10,
        difficulty: 'Medium'
    },
    {
        name: 'Chemistry',
        code: 'CY',
        stream: 'Science',
        description: 'Physical chemistry, organic chemistry, inorganic chemistry, and analytical chemistry.',
        papers: 10,
        difficulty: 'Medium'
    },
    {
        name: 'Statistics',
        code: 'ST',
        stream: 'Science',
        description: 'Probability theory, statistical inference, and regression analysis.',
        papers: 8,
        difficulty: 'Medium'
    },
    {
        name: 'Data Science and Artificial Intelligence',
        code: 'DA',
        stream: 'Engineering',
        description: 'Machine learning, deep learning, data structures, and algorithms.',
        papers: 8,
        difficulty: 'High'
    },
    {
        name: 'Engineering Sciences',
        code: 'XE',
        stream: 'Engineering',
        description: 'Flexible examination with multiple optional papers for specialized knowledge.',
        papers: 5,
        difficulty: 'Medium-High'
    },
    {
        name: 'Life Sciences',
        code: 'XL',
        stream: 'Science',
        description: 'Cell biology, genetics, ecology, and biochemistry.',
        papers: 5,
        difficulty: 'Medium'
    },
    {
        name: 'Chemical Engineering',
        code: 'CH',
        stream: 'Engineering',
        description: 'Process calculations, fluid mechanics, heat transfer, and mass transfer.',
        papers: 13,
        difficulty: 'Medium'
    },
    {
        name: 'Instrumentation Engineering',
        code: 'IN',
        stream: 'Engineering',
        description: 'Measurement systems, sensors, signal processing, and control systems.',
        papers: 12,
        difficulty: 'Medium'
    },
    {
        name: 'Production and Industrial Engineering',
        code: 'PI',
        stream: 'Engineering',
        description: 'Production processes, quality control, operations research, and manufacturing.',
        papers: 10,
        difficulty: 'Medium'
    },
    {
        name: 'Metallurgical Engineering',
        code: 'MT',
        stream: 'Engineering',
        description: 'Physical metallurgy, extractive metallurgy, and material science.',
        papers: 8,
        difficulty: 'Medium'
    },
    {
        name: 'Petroleum Engineering',
        code: 'PE',
        stream: 'Engineering',
        description: 'Drilling, reservoir engineering, and production operations.',
        papers: 7,
        difficulty: 'Medium-High'
    },
    {
        name: 'Mining Engineering',
        code: 'MN',
        stream: 'Engineering',
        description: 'Mining methods, mineral processing, and safety engineering.',
        papers: 6,
        difficulty: 'Medium'
    },
    {
        name: 'Environmental Science and Engineering',
        code: 'ES',
        stream: 'Engineering',
        description: 'Environmental management, wastewater treatment, and air quality.',
        papers: 6,
        difficulty: 'Medium'
    },
    {
        name: 'Geology and Geophysics',
        code: 'GG',
        stream: 'Science',
        description: 'Mineralogy, structural geology, and geophysical methods.',
        papers: 5,
        difficulty: 'Medium'
    },
    {
        name: 'Geomatics Engineering',
        code: 'GE',
        stream: 'Engineering',
        description: 'Surveying, remote sensing, GIS, and cartography.',
        papers: 5,
        difficulty: 'Medium'
    },
    {
        name: 'Ecology and Evolution',
        code: 'EY',
        stream: 'Science',
        description: 'Population ecology, community ecology, and evolutionary biology.',
        papers: 4,
        difficulty: 'Medium'
    },
    {
        name: 'Aerospace Engineering',
        code: 'AE',
        stream: 'Engineering',
        description: 'Aerodynamics, flight mechanics, and aircraft design.',
        papers: 7,
        difficulty: 'Medium-High'
    },
    {
        name: 'Naval Architecture and Marine Engineering',
        code: 'NM',
        stream: 'Engineering',
        description: 'Ship design, marine propulsion, and ocean engineering.',
        papers: 6,
        difficulty: 'Medium'
    },
    {
        name: 'Biomedical Engineering',
        code: 'BM',
        stream: 'Engineering',
        description: 'Biomechanics, medical devices, and biomedical signal processing.',
        papers: 5,
        difficulty: 'Medium'
    },
    {
        name: 'Biotechnology',
        code: 'BT',
        stream: 'Engineering',
        description: 'Genetic engineering, fermentation, and biochemical engineering.',
        papers: 5,
        difficulty: 'Medium'
    },
    {
        name: 'Agricultural Engineering',
        code: 'AG',
        stream: 'Engineering',
        description: 'Farm machinery, soil and water conservation, and agricultural processes.',
        papers: 5,
        difficulty: 'Medium'
    },
    {
        name: 'Textile Engineering and Fibre Science',
        code: 'TF',
        stream: 'Engineering',
        description: 'Fiber production, yarn manufacturing, and textile processing.',
        papers: 4,
        difficulty: 'Medium'
    },
    {
        name: 'Architecture and Planning',
        code: 'AR',
        stream: 'Engineering',
        description: 'Building design, urban planning, and sustainable architecture.',
        papers: 5,
        difficulty: 'Medium'
    },
    {
        name: 'Humanities and Social Sciences',
        code: 'XH',
        stream: 'Social Sciences',
        description: 'Economics, psychology, political science, and sociology.',
        papers: 4,
        difficulty: 'Medium'
    }
];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const noResults = document.getElementById('noResults');

const subjectIcons = {
    AE: '✈️',
    AG: '🌾',
    AR: '🏛️',
    BM: '🫀',
    BT: '🧬',
    CE: '🏗️',
    CH: '⚗️',
    CS: '💻',
    CY: '🧪',
    DA: '🤖',
    EC: '📡',
    EE: '⚡',
    ES: '🌍',
    EY: '🦋',
    GE: '🗺️',
    GG: '⛰️',
    IN: '🔬',
    MA: '📐',
    ME: '⚙️',
    MN: '⛏️',
    MT: '🔥',
    NM: '🚢',
    PE: '🛢️',
    PH: '⚛️',
    PI: '🏭',
    ST: '📊',
    TF: '🧵',
    XE: '🔧',
    XH: '📚',
    XL: '🧫'
};

const subjectAliases = {
    AE: ['aero', 'aerospace'],
    AG: ['agri', 'agriculture'],
    AR: ['arch', 'architecture'],
    BM: ['biomed', 'biomedical'],
    BT: ['biotech', 'biotechnology'],
    CE: ['civil'],
    CH: ['chemical'],
    CS: ['cse', 'csit', 'comp', 'computer'],
    CY: ['chem'],
    DA: ['ds', 'ai', 'dsai', 'datascience'],
    EC: ['ece', 'electronics'],
    EE: ['eee', 'electrical'],
    ES: ['environmental', 'env'],
    GE: ['geomatics', 'gis'],
    GG: ['geology', 'geophysics'],
    IN: ['instr', 'instrumentation'],
    MA: ['maths', 'mathematics'],
    ME: ['mech', 'mechanical'],
    MN: ['mining'],
    MT: ['metallurgy', 'metallurgical'],
    NM: ['naval', 'marine'],
    PE: ['petroleum'],
    PH: ['physics'],
    PI: ['production', 'industrial'],
    ST: ['stats', 'statistics'],
    TF: ['textile'],
    XE: ['engg sciences', 'engineering sciences'],
    XH: ['hss', 'humanities'],
    XL: ['life science', 'lifescience']
};

const pdfIndex = {};

function normalizeSubjectName(name) {
    return (name || '').replace(/\s+/g, ' ').trim();
}

function normalizePdfSubject(name) {
    const normalized = normalizeSubjectName(name);
    if (normalized === 'Textiles Engineering and Fibre Science') {
        return 'Textile Engineering and Fibre Science';
    }
    return normalized;
}

function slugifySubjectName(name) {
    return normalizeSubjectName(name)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

function buildSubjectPageUrl(subject) {
    const code = String(subject.code || '').toLowerCase();
    const nameSlug = slugifySubjectName(subject.name || 'subject');
    return `/gate/${code}-${nameSlug}/`;
}

function buildSubjectSearchTokens(subject) {
    const baseTokens = [
        subject.name || '',
        subject.code || '',
        subject.stream || ''
    ];

    const aliases = subjectAliases[subject.code] || [];
    return baseTokens.concat(aliases).join(' ').toLowerCase();
}

function getSearchScore(card, searchTerm) {
    const code = String(card.dataset.code || '').toLowerCase();
    const name = String(card.dataset.name || '').toLowerCase();
    const stream = String(card.dataset.stream || '').toLowerCase();
    const aliases = String(card.dataset.aliases || '').split(' ').filter(Boolean);
    const tokens = String(card.dataset.searchTokens || '').toLowerCase();

    if (!searchTerm || !tokens.includes(searchTerm)) {
        return -1;
    }

    if (code === searchTerm) return 1000;
    if (aliases.includes(searchTerm)) return 950;
    if (name === searchTerm) return 900;

    if (code.startsWith(searchTerm)) return 860;
    if (aliases.some(alias => alias.startsWith(searchTerm))) return 820;
    if (name.startsWith(searchTerm)) return 780;

    const wordBoundaryMatch = new RegExp(`\\b${searchTerm.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}`);
    if (wordBoundaryMatch.test(name)) return 720;
    if (wordBoundaryMatch.test(stream)) return 680;

    return 600 - tokens.indexOf(searchTerm);
}

function parseDriveId(url) {
    if (!url) return '';
    const match = url.match(/\/d\/([^/]+)\//) || url.match(/[?&]id=([^&]+)/);
    return match ? match[1] : '';
}

function toDownloadUrl(url) {
    const id = parseDriveId(url);
    return id ? `https://drive.google.com/uc?export=download&id=${id}` : url;
}

function buildPdfIndex(data) {
    if (!Array.isArray(data)) return;
    data.forEach(item => {
        const subject = normalizePdfSubject(item['Subject']);
        if (!subject) return;
        if (!pdfIndex[subject]) pdfIndex[subject] = [];
        pdfIndex[subject].push({
            title: item['PDF File Name'],
            url: item['Direct PDF Link']
        });
    });

    Object.keys(pdfIndex).forEach(subject => {
        pdfIndex[subject].sort((a, b) => {
            const yearA = (a.title || '').match(/\b(\d{4})\b/);
            const yearB = (b.title || '').match(/\b(\d{4})\b/);
            const numA = yearA ? parseInt(yearA[1], 10) : 0;
            const numB = yearB ? parseInt(yearB[1], 10) : 0;
            if (numA !== numB) return numB - numA;
            return (a.title || '').localeCompare(b.title || '');
        });
    });
}

async function loadPdfIndex() {
    try {
        const response = await fetch('../assets/data/gate-qns.json', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load GATE PDF index');
        const data = await response.json();
        buildPdfIndex(data);
    } catch (error) {
        console.warn('GATE PDF index unavailable:', error);
    }
}

function getSubjectPapers(subjectName, code, fallbackCount) {
    const normalized = normalizeSubjectName(subjectName);
    if (pdfIndex[normalized] && pdfIndex[normalized].length) {
        return pdfIndex[normalized];
    }
    return generatePYQs(code, fallbackCount).map(title => ({ title: title, url: '' }));
}

// Initialize subjects on page load
document.addEventListener('DOMContentLoaded', async () => {
    renderSubjectCards();
    addEventListeners();
});

// Render subject cards
function renderSubjectCards() {
    const subjectsGrid = document.getElementById('subjectsGrid');
    subjectsGrid.innerHTML = '';

    subjects.forEach(subject => {
        subjectsGrid.appendChild(createSubjectCard(subject));
    });
}

// Create individual subject card
function createSubjectCard(subject) {
    const card = document.createElement('a');
    card.className = 'subject-card';
    card.dataset.code = subject.code;
    card.dataset.name = subject.name.toLowerCase();
    card.dataset.stream = subject.stream.toLowerCase();
    card.dataset.aliases = (subjectAliases[subject.code] || []).join(' ').toLowerCase();
    card.dataset.searchTokens = buildSubjectSearchTokens(subject);
    card.href = buildSubjectPageUrl(subject);
    card.title = `${subject.name} (${subject.code}) - GATE PYQ`;
    card.setAttribute('aria-label', `${subject.name} (${subject.code}) - GATE PYQ`);

    const icon = subjectIcons[subject.code] || '📘';

    card.innerHTML = `
        <div class="subject-icon">${icon}</div>
        <div class="subject-code-badge">${subject.code}</div>
        <h3 class="subject-title">${subject.name}</h3>
        <div class="subject-tags">
            <span class="subject-tag">${subject.stream}</span>
        </div>
    `;

    return card;
}

// Search functionality
function addEventListeners() {
    searchInput.addEventListener('input', handleSearch);
    clearBtn.addEventListener('click', clearSearch);
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();

    if (searchTerm.length > 0) {
        clearBtn.style.display = 'block';
    } else {
        clearBtn.style.display = 'none';
    }

    // Filter cards view
    filterSubjectCards(searchTerm);
}

function filterSubjectCards(searchTerm) {
    if (!searchTerm) {
        renderSubjectCards();
        noResults.classList.remove('show');
        return;
    }

    const allCards = document.querySelectorAll('.subject-card');
    const subjectsGrid = document.getElementById('subjectsGrid');
    let visibleCount = 0;
    const matchedCards = [];

    allCards.forEach(card => {
        const score = getSearchScore(card, searchTerm);
        if (score >= 0) {
            card.classList.remove('hidden');
            visibleCount++;
            matchedCards.push({ card, score });
        } else {
            card.classList.add('hidden');
        }
    });

    matchedCards
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            const codeA = String(a.card.dataset.code || '');
            const codeB = String(b.card.dataset.code || '');
            return codeA.localeCompare(codeB);
        })
        .forEach(item => {
            subjectsGrid.appendChild(item.card);
        });

    if (visibleCount === 0 && searchTerm) {
        noResults.classList.add('show');
    } else {
        noResults.classList.remove('show');
    }
}

function clearSearch() {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    renderSubjectCards();
    searchInput.focus();
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for search focus
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
    // Escape to clear search
    if (e.key === 'Escape' && searchInput.value) {
        clearSearch();
    }
});
