function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const btn = document.querySelector('.theme-btn');
    
    // Save preference to localStorage
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    // Update icon
    const icon = btn.querySelector('i');
    if (isDarkMode) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Apply saved theme preference on page load
window.addEventListener('load', function() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        const btn = document.querySelector('.theme-btn');
        if (btn) {
            const icon = btn.querySelector('i');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
});

// Add smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// -------------------- SMART SEARCH (Notes + Syllabus + PYQs) --------------------
(function initSmartSearch() {
    const input = document.querySelector('#global-search') || document.querySelector('.search-box');
    const list = document.getElementById('search-suggestions');
    if (!input || !list) return;

    const MAX_SUGGESTIONS = 8;
    let index = [];
    let visible = false;
    let active = -1;
    let lastResults = [];

    const normalize = (s) => (s || '').toString().toLowerCase();
    const tokenize = (q) => normalize(q).split(/\s+/).filter(Boolean);

    // Comprehensive mapping of all department subjects
    const DEPT_SUBJECTS = {
        'CSE': {
            '2021': {
                '1': ['Professional English-I', 'Matrices and Calculus', 'Engineering Physics', 'Engineering Chemistry', 'Problem Solving and Python Programming', 'Heritage of Tamils'],
                '2': ['Professional English-II', 'Statistics and Numerical Methods', 'Physics for Information Science', 'Basic Electrical and Electronics Engineering', 'Engineering Graphics', 'Programming in C', 'Tamils and Technology'],
                '3': ['Discrete Mathematics', 'Digital Principles and Computer Organization', 'Foundations of Data Science', 'Data Structures', 'Object Oriented Programming'],
                '4': ['Theory of Computation', 'Artificial Intelligence and Machine Learning', 'Database Management Systems', 'Algorithms', 'Introduction to Operating Systems', 'Environmental Sciences and Sustainability'],
                '5': ['Computer Networks', 'Complier Design', 'Cryptography and Cyber Security', 'Distributed Computing'],
                '6': ['Object Oriented Software Engineering', 'Embedded Systems and IoT'],
                '7': ['Human Values and Ethics']
            }
        },
        'ECE': {
            '2021': {
                '1': ['Professional English - I', 'Matrices and Calculus', 'Engineering Physics', 'Engineering Chemistry', 'Problem Solving and Python Programming', 'Heritage of Tamils'],
                '2': ['Professional English - II', 'Statistics and Numerical Methods', 'Physics for Electronics Engineering', 'Engineering Graphics', 'Circuit Analysis', 'Tamils and Technology'],
                '3': ['Random Processes and Linear Algebra', 'C Programming and Data Structures', 'Signals and Systems', 'Electronic Devices and Circuits', 'Control Systems', 'Digital Systems Design'],
                '4': ['Electromagnetic Fields', 'Networks and Security', 'Linear Integrated Circuits', 'Digital Signal Processing', 'Communication Systems', 'Environmental Sciences and Sustainability', 'Microprocessor and Microcontroller'],
                '5': ['Wireless Communication', 'VLSI and Chip Design', 'Transmission Lines and RF Systems', 'VLSI Laboratory'],
                '6': ['Embedded Systems and IoT Design', 'Artificial Intelligence and Machine Learning'],
                '7': ['Human Values and Ethics']
            }
        },
        'EEE': {
            '2021': {
                '1': ['Professional English-I', 'Matrices and Calculus', 'Engineering Physics', 'Engineering Chemistry', 'Problem Solving and Python Programming', 'Heritage of Tamils'],
                '2': ['Professional English II', 'Statistics and Numerical Methods', 'Physics for Electrical Engineering', 'Basic Civil and Mechanical Engineering', 'Engineering Graphics', 'Electric Circuit Analysis', 'Tamils and Technology'],
                '3': ['Probability and Complex Functions', 'Electromagnetic Fields', 'Digital Logic Circuits', 'Electron Devices and Circuits', 'Electrical Machines I', 'C Programming and Data Structures'],
                '4': ['Environmental Sciences and Sustainability', 'Transmission and Distribution', 'Linear Integrated Circuits', 'Measurements and Instrumentation', 'Microprocessor and Microcontroller', 'Electrical Machines II'],
                '5': ['Power System Analysis', 'Power Electronics', 'Control Systems'],
                '6': ['Protection and Switchgear', 'Power System Operation and Control'],
                '7': ['High Voltage Engineering', 'Human Values and Ethics']
            }
        },
        'MECH': {
            '2021': {
                '1': ['Professional English - I', 'Matrices and Calculus', 'Engineering Physics', 'Engineering Chemistry', 'Problem Solving and Python Programming', 'Heritage of Tamils'],
                '2': ['Professional English - II', 'Statistics and Numerical Methods', 'Materials Science', 'Basic Electrical and Electronics Engineering', 'Engineering Graphics', 'Tamils and Technology'],
                '3': ['Transforms and Partial Differential Equations', 'Engineering Mechanics', 'Engineering Thermodynamics', 'Fluid Mechanics and Machinery', 'Engineering Materials and Metallurgy', 'Manufacturing Processes'],
                '4': ['Theory of Machines', 'Thermal Engineering', 'Hydraulics and Pneumatics', 'Manufacturing Technology', 'Strength of Materials', 'Environmental Sciences and Sustainability'],
                '5': ['Design of Machine Elements', 'Metrology and Measurements'],
                '6': ['Heat and Mass Transfer'],
                '7': ['Mechatronics and IoT', 'Computer Integrated Manufacturing', 'Human Values and Ethics', 'Industrial Management']
            }
        },
        'CIVIL': {
            '2021': {
                '1': ['Professional English - I', 'Matrices and Calculus', 'Engineering Physics', 'Engineering Chemistry', 'Problem Solving and Python Programming', 'Heritage of Tamils'],
                '2': ['Professional English - II', 'Statistics and Numerical Methods', 'Engineering Mechanics', 'Engineering Graphics', 'Tamils and Technology'],
                '3': ['Transforms and Partial Differential Equations', 'Strength of Materials', 'Fluid Mechanics', 'Surveying', 'Engineering Geology', 'Building Materials and Construction'],
                '4': ['Soil Mechanics', 'Structural Analysis I', 'Water Resources Engineering', 'Highway Engineering', 'Environmental Sciences and Sustainability'],
                '5': ['Design of Reinforced Concrete Elements', 'Structural Analysis II', 'Foundation Engineering', 'Environmental Engineering I'],
                '6': ['Design of Steel Structures', 'Environmental Engineering II', 'Transportation Engineering'],
                '7': ['Human Values and Ethics', 'Construction Planning and Scheduling']
            }
        },
        'IT': {
            '2021': {
                '1': ['Professional English-I', 'Matrices and Calculus', 'Engineering Physics', 'Engineering Chemistry', 'Problem Solving and Python Programming', 'Heritage of Tamils'],
                '2': ['Professional English-II', 'Statistics and Numerical Methods', 'Physics for Information Science', 'Basic Electrical and Electronics Engineering', 'Engineering Graphics', 'Programming in C', 'Tamils and Technology'],
                '3': ['Discrete Mathematics', 'Digital Principles and Computer Organization', 'Data Structures', 'Object Oriented Programming', 'Database Management Systems'],
                '4': ['Theory of Computation', 'Computer Networks', 'Operating Systems', 'Software Engineering', 'Environmental Sciences and Sustainability'],
                '5': ['Cryptography and Network Security', 'Web Technology', 'Mobile Application Development'],
                '6': ['Artificial Intelligence', 'Cloud Computing'],
                '7': ['Human Values and Ethics', 'Information Security']
            }
        }
    };

    function escapeHtml(s) {
        return (s || '').toString().replace(/[&<>"']/g, (c) => {
            if (c === '&') return '&amp;';
            if (c === '<') return '&lt;';
            if (c === '>') return '&gt;';
            if (c === '"') return '&quot;';
            return '&#39;';
        });
    }

    function toStringSafe(v) { return v == null ? '' : String(v); }

    function guess(obj, keys) {
        for (const k of keys) {
            if (obj && Object.prototype.hasOwnProperty.call(obj, k) && obj[k] != null) return obj[k];
        }
        return undefined;
    }

    function toArray(v) { return Array.isArray(v) ? v : (v ? [v] : []); }

    function extractItems(json, type) {
        const items = [];
        
        // Common first semester subjects across all departments
        const commonSem1Subjects = [
            'Professional English-I', 'Professional English - I',
            'Matrices and Calculus',
            'Engineering Physics',
            'Engineering Chemistry',
            'Problem Solving and Python Programming',
            'Heritage of Tamils'
        ];
        
        const allDepts = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];
        
        // Special handling for data.json (Notes) with nested regulations/semesters
        if (type === 'Notes' && json.regulations) {
            Object.entries(json.regulations).forEach(([regYear, semesters]) => {
                Object.entries(semesters).forEach(([semNum, subjects]) => {
                    Object.entries(subjects).forEach(([subjectName, subjectData]) => {
                        // Skip empty pdfs array
                        if (!subjectData.pdfs || subjectData.pdfs.length === 0) {
                            return;
                        }
                        
                        // Build proper URL with query parameters
                        const subjectEncoded = encodeURIComponent(subjectName);
                        const baseUrl = `../pdfs/pdfs.html?regulation=${regYear}&semester=${semNum}&subject=${subjectEncoded}`;
                        
                        // Check if this is a common semester 1 subject
                        const isCommonSem1 = semNum === '1' && commonSem1Subjects.some(cs => 
                            normalize(subjectName).includes(normalize(cs)) || 
                            normalize(cs).includes(normalize(subjectName))
                        );
                        
                        if (isCommonSem1) {
                            // Add separate entry for each department
                            allDepts.forEach(dept => {
                                items.push({
                                    label: `${subjectName} (${dept})`,
                                    url: baseUrl,
                                    type,
                                    subject: subjectName,
                                    keywords: [subjectName, dept, `sem${semNum}`, `semester${semNum}`, regYear],
                                    searchText: normalize(`${subjectName} ${dept} sem${semNum} semester ${semNum} ${regYear}`)
                                });
                            });
                        } else {
                            // Regular subject - single entry
                            items.push({
                                label: `${subjectName} (Sem ${semNum})`,
                                url: baseUrl,
                                type,
                                subject: subjectName,
                                keywords: [subjectName, `sem${semNum}`, `semester${semNum}`, regYear],
                                searchText: normalize(`${subjectName} sem${semNum} semester ${semNum} ${regYear}`)
                            });
                        }
                    });
                });
            });
            return items;
        }
        
        // Special handling for sydata.json (Syllabus)
        if (type === 'Syllabus' && typeof json === 'object') {
            Object.entries(json).forEach(([dept, data]) => {
                if (data && typeof data === 'object') {
                    Object.entries(data).forEach(([regYear, regData]) => {
                        // Whole syllabus
                        if (regData.whole && regData.whole.pdf) {
                            items.push({
                                label: regData.whole.title || `${dept} Complete Syllabus`,
                                url: '../syllabus/syllabus.html',
                                type,
                                subject: dept,
                                keywords: [dept, regYear, 'complete', 'syllabus'],
                                searchText: normalize(`${dept} ${regYear} complete syllabus`)
                            });
                        }
                        // Semester-wise
                        if (regData.semesters) {
                            Object.entries(regData.semesters).forEach(([semNum, semData]) => {
                                items.push({
                                    label: `${dept} Semester ${semNum} Syllabus`,
                                    url: '../syllabus/syllabus.html',
                                    type,
                                    subject: dept,
                                    keywords: [dept, `sem${semNum}`, regYear, 'syllabus'],
                                    searchText: normalize(`${dept} semester ${semNum} ${regYear} syllabus`)
                                });
                            });
                        }
                    });
                }
            });
            return items;
        }
        
        // Special handling for qn.json (Question Papers)
        if (type === 'Question Paper' && typeof json === 'object') {
            Object.entries(json).forEach(([dept, data]) => {
                if (data && typeof data === 'object') {
                    Object.entries(data).forEach(([regYear, semesters]) => {
                        if (semesters && typeof semesters === 'object') {
                            Object.entries(semesters).forEach(([semNum, subjects]) => {
                                if (subjects && typeof subjects === 'object') {
                                    Object.entries(subjects).forEach(([subjectName, papers]) => {
                                        if (Array.isArray(papers) && papers.some(p => p.pdf)) {
                                            items.push({
                                                label: `${subjectName} (${dept})`,
                                                url: '../question%20paper/question.html',
                                                type,
                                                subject: subjectName,
                                                keywords: [dept, subjectName, `sem${semNum}`, regYear, 'question', 'paper'],
                                                searchText: normalize(`${subjectName} ${dept} sem${semNum} ${regYear} question paper`)
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
            return items;
        }
        
        return items;
    }

    async function buildIndex() {
        const SOURCES = [
            { url: '../pdfs/data.json', type: 'Notes' },
            { url: '../syllabus/sydata.json', type: 'Syllabus' },
            { url: '../question%20paper/qn.json', type: 'Question Paper' }
        ];
        try {
            const results = await Promise.allSettled(
                SOURCES.map(s => fetch(s.url).then(r => r.json()).then(j => ({ type: s.type, data: j })))
            );
            const all = [];
            
            // Add items from JSON files
            for (const r of results) {
                if (r.status === 'fulfilled') {
                    all.push(...extractItems(r.value.data, r.value.type));
                }
            }
            
            // Add all department subjects for Notes
            Object.entries(DEPT_SUBJECTS).forEach(([dept, regulations]) => {
                Object.entries(regulations).forEach(([regYear, semesters]) => {
                    Object.entries(semesters).forEach(([semNum, subjects]) => {
                        subjects.forEach(subjectName => {
                            if (!subjectName || subjectName.trim() === '') return;
                            const subjectEncoded = encodeURIComponent(subjectName);
                            all.push({
                                label: `${subjectName} (${dept} - Sem ${semNum})`,
                                url: `../pdfs/pdfs.html?regulation=${regYear}&semester=${semNum}&subject=${subjectEncoded}`,
                                type: 'Notes',
                                subject: subjectName,
                                dept: dept,
                                keywords: [subjectName, dept, `sem${semNum}`, `semester${semNum}`, regYear],
                                searchText: normalize(`${subjectName} ${dept} sem${semNum} semester ${semNum} ${regYear}`)
                            });
                        });
                    });
                });
            });
            
            const seen = new Set();
            index = all.filter(it => {
                const key = it.url + '|' + it.label;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        } catch (e) {
            console.error('Search index build failed', e);
        }
    }

    function scoreItem(item, tokens) {
        let score = 0;
        const label = normalize(item.label);
        const kws = item.keywords.map(normalize);
        for (const t of tokens) {
            if (label.startsWith(t)) score += 4;
            else if (label.includes(t)) score += 2;
            if (kws.some(k => k.startsWith(t))) score += 3;
            else if (kws.some(k => k.includes(t))) score += 1;
            if (item.searchText.includes(t)) score += 1;
        }
        return score;
    }

    function highlight(text, tokens) {
        let result = text;
        tokens.forEach(t => {
            if (!t) return;
            const esc = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            result = result.replace(new RegExp(`(${esc})`, 'ig'), '<mark>$1</mark>');
        });
        return result;
    }

    function showSuggestions(items, tokens) {
        if (!items.length) {
            list.innerHTML = '<div class="empty">No matches found</div>';
            list.classList.add('visible');
            input.setAttribute('aria-expanded','true');
            active = -1;
            visible = true;
            return;
        }
        const html = items.slice(0, MAX_SUGGESTIONS).map((it, i) => `
            <div class="search-suggestion-item" role="option" data-index="${i}">
                <div class="label">${highlight(escapeHtml(it.label), tokens)}</div>
                <div class="type-badge">${it.type}</div>
            </div>
        `).join('');
        list.innerHTML = html;
        list.classList.add('visible');
        input.setAttribute('aria-expanded','true');
        active = -1;
        visible = true;
    }

    function hideSuggestions() {
        list.classList.remove('visible');
        input.setAttribute('aria-expanded','false');
        visible = false;
        active = -1;
    }

    function selectByIndex(ix) {
        const nodes = Array.from(list.querySelectorAll('.search-suggestion-item'));
        nodes.forEach(n => n.classList.remove('active'));
        if (ix >= 0 && nodes[ix]) {
            nodes[ix].classList.add('active');
            active = ix;
        } else {
            active = -1;
        }
    }

    function navigateTo(item) {
        if (item && item.url) {
            window.location.href = item.url;
        }
    }

    function onInput(e) {
        const q = e.target.value || '';
        const tokens = tokenize(q);
        if (!tokens.length) { hideSuggestions(); return; }
        const matches = index
            .map(it => ({ it, s: scoreItem(it, tokens) }))
            .filter(x => x.s > 0)
            .sort((a,b) => b.s - a.s)
            .map(x => x.it);
        lastResults = matches;
        showSuggestions(matches, tokens);
    }

    input.addEventListener('input', onInput);

    input.addEventListener('keydown', (e) => {
        if (!visible) return;
        if (e.key === 'ArrowDown' || e.key === 'Down') {
            e.preventDefault();
            const len = Math.min(lastResults.length, MAX_SUGGESTIONS);
            if (len === 0) return;
            active = (active + 1 + len) % len;
            selectByIndex(active);
        } else if (e.key === 'ArrowUp' || e.key === 'Up') {
            e.preventDefault();
            const len = Math.min(lastResults.length, MAX_SUGGESTIONS);
            if (len === 0) return;
            active = (active - 1 + len) % len;
            selectByIndex(active);
        } else if (e.key === 'Enter') {
            if (lastResults.length) {
                e.preventDefault();
                const target = active >= 0 ? lastResults[active] : lastResults[0];
                navigateTo(target);
            }
        } else if (e.key === 'Escape' || e.key === 'Esc') {
            hideSuggestions();
        }
    });

    list.addEventListener('mousedown', (e) => e.preventDefault());

    list.addEventListener('click', (e) => {
        const itemEl = e.target.closest('.search-suggestion-item');
        if (!itemEl) return;
        const ix = Number(itemEl.dataset.index || -1);
        const target = lastResults[ix];
        if (target) navigateTo(target);
    });

    input.addEventListener('blur', () => setTimeout(hideSuggestions, 120));

    // Build initial index
    buildIndex();
})();