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
let selectedSubject = null;

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
    await loadPdfIndex();
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
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.dataset.code = subject.code;
    card.dataset.name = subject.name.toLowerCase();
    card.dataset.stream = subject.stream.toLowerCase();
    card.onclick = () => handleSubjectClick(subject.code);

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
    const allCards = document.querySelectorAll('.subject-card');
    let visibleCount = 0;

    allCards.forEach(card => {
        const subjectText = `${card.dataset.name} ${card.dataset.code} ${card.dataset.stream}`;
        if (subjectText.includes(searchTerm)) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
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

// Handle subject click - Open modal
function handleSubjectClick(code) {
    selectedSubject = subjects.find(s => s.code === code);
    if (selectedSubject) {
        openModal();
    }
}

// Open modal
function openModal() {
    if (!selectedSubject) return;
    document.getElementById('modalOverlay').classList.add('active');
    document.getElementById('modalContent').classList.add('active');
    updateModalContent();
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.getElementById('modalContent').classList.remove('active');
    selectedSubject = null;
    document.body.style.overflow = 'auto';
}

// Update modal content with selected subject's PYQs
function updateModalContent() {
    if (!selectedSubject) return;

    const modalBody = document.getElementById('modalBody');
    const icon = subjectIcons[selectedSubject.code] || '📘';
    const papers = getSubjectPapers(selectedSubject.name, selectedSubject.code, selectedSubject.papers);

    let pyqsHTML = papers.map((paper, index) => {
        const paperTitle = paper.title || '';
        const viewLink = paper.url || '';
        const downloadLink = viewLink ? toDownloadUrl(viewLink) : '';
        const viewAction = viewLink
            ? `<a class="pyq-link" href="${viewLink}" target="_blank" rel="noopener">View</a>`
            : `<span class="pyq-link disabled">View</span>`;
        const downloadAction = downloadLink
            ? `<a class="pyq-link secondary" href="${downloadLink}" target="_blank" rel="noopener">Download</a>`
            : `<span class="pyq-link secondary disabled">Download</span>`;

        return `
        <div class="pyq-item" style="animation-delay: ${index * 0.08}s;">
            <div class="pyq-item-icon">📄</div>
            <div class="pyq-item-name">${paperTitle}</div>
            <div class="pyq-actions">${viewAction}${downloadAction}</div>
        </div>
        `;
    }).join('');

    modalBody.innerHTML = `
        <div class="modal-subject-info">
            <div class="modal-subject-icon">${icon}</div>
            <div class="modal-subject-details">
                <h2>
                    ${selectedSubject.name}
                    <span class="modal-subject-code">${selectedSubject.code}</span>
                </h2>
                <p>${selectedSubject.papers} Papers Available</p>
            </div>
        </div>
        <div class="pyq-list">
            ${pyqsHTML}
        </div>
    `;
}

// Generate PYQ list for a subject
function generatePYQs(code, paperCount) {
    const pyqs = [];
    const currentYear = 2024;
    const yearsBack = Math.min(Math.ceil(paperCount / 2), 10);

    for (let year = currentYear; year > currentYear - yearsBack; year--) {
        const papersPerYear = paperCount >= 14 ? 2 : 1;
        for (let i = 1; i <= papersPerYear && pyqs.length < paperCount; i++) {
            pyqs.push(`${code} ${year} Paper ${papersPerYear > 1 ? i : ''}`.trim());
        }
    }

    return pyqs.slice(0, paperCount);
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && selectedSubject) {
        closeModal();
    }
});

// Prevent scroll when modal is open
function updateBodyScroll() {
    if (selectedSubject) {
        document.body.style.overflow = 'hidden';
    }
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
