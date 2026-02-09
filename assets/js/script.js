function toggleDarkMode() {
    // Use shared theme system
    if(window.theme && window.theme.toggle){
        window.theme.toggle();
    }
}

// Apply saved theme preference on page load
window.addEventListener('load', function() {
    // Initialize theme from shared system
    if(window.theme && window.theme.init){
        window.theme.init();
    }
    initNavToggle();
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

    // Comprehensive mapping of all department subjects

    function guess(obj, keys) {
        for (const k of keys) {
            if (obj && Object.prototype.hasOwnProperty.call(obj, k) && obj[k] != null) return obj[k];
        }
        return undefined;
    }

    function toArray(v) { return Array.isArray(v) ? v : (v ? [v] : []); }

    // Subject-code catalog (used when PDF metadata lacks codes)
    const SUBJECT_CODE_ENTRIES = [
        // Common Semester 1
        { code: 'HS3152', subject: 'Professional English-I', reg: '2021', sem: '1', depts: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'] },
        { code: 'MA3151', subject: 'Matrices and Calculus', reg: '2021', sem: '1', depts: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'] },
        { code: 'PH3151', subject: 'Engineering Physics', reg: '2021', sem: '1', depts: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'] },
        { code: 'CY3151', subject: 'Engineering Chemistry', reg: '2021', sem: '1', depts: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'] },
        { code: 'GE3151', subject: 'Problem Solving and Python Programming', reg: '2021', sem: '1', depts: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'] },
        { code: 'GE3152', subject: 'Heritage of Tamils', reg: '2021', sem: '1', depts: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'] },

        // CSE Sem 2
        { code: 'HS3252', subject: 'Professional English-II', reg: '2021', sem: '2', depts: ['CSE'] },
        { code: 'MA3251', subject: 'Statistics and Numerical Methods', reg: '2021', sem: '2', depts: ['CSE'] },
        { code: 'PH3256', subject: 'Physics for Information Science', reg: '2021', sem: '2', depts: ['CSE'] },
        { code: 'BE3251', subject: 'Basic Electrical and Electronics Engineering', reg: '2021', sem: '2', depts: ['CSE'] },
        { code: 'GE3251', subject: 'Engineering Graphics', reg: '2021', sem: '2', depts: ['CSE'] },
        { code: 'CS3251', subject: 'Programming in C', reg: '2021', sem: '2', depts: ['CSE'] },
        { code: 'GE3252', subject: 'Tamils and Technology', reg: '2021', sem: '2', depts: ['CSE'] },

        // CSE Sem 3
        { code: 'MA3354', subject: 'Discrete Mathematics', reg: '2021', sem: '3', depts: ['CSE'] },
        { code: 'CS3351', subject: 'Digital Principles and Computer Organization', reg: '2021', sem: '3', depts: ['CSE'] },
        { code: 'CS3352', subject: 'Foundations of Data Science', reg: '2021', sem: '3', depts: ['CSE'] },
        { code: 'CS3301', subject: 'Data Structures', reg: '2021', sem: '3', depts: ['CSE'] },
        { code: 'CS3391', subject: 'Object Oriented Programming', reg: '2021', sem: '3', depts: ['CSE'] },

        // CSE Sem 4
        { code: 'CS3452', subject: 'Theory of Computation', reg: '2021', sem: '4', depts: ['CSE'] },
        { code: 'CS3491', subject: 'Artificial Intelligence and Machine Learning', reg: '2021', sem: '4', depts: ['CSE'] },
        { code: 'CS3492', subject: 'Database Management Systems', reg: '2021', sem: '4', depts: ['CSE'] },
        { code: 'CS3401', subject: 'Algorithms', reg: '2021', sem: '4', depts: ['CSE'] },
        { code: 'CS3451', subject: 'Introduction to Operating Systems', reg: '2021', sem: '4', depts: ['CSE'] },
        { code: 'GE3451', subject: 'Environmental Sciences and Sustainability', reg: '2021', sem: '4', depts: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'] },

        // CSE Sem 5
        { code: 'CS3591', subject: 'Computer Networks', reg: '2021', sem: '5', depts: ['CSE'] },
        { code: 'CS3501', subject: 'Complier Design', reg: '2021', sem: '5', depts: ['CSE'] },
        { code: 'CB3491', subject: 'Cryptography and Cyber Security', reg: '2021', sem: '5', depts: ['CSE'] },
        { code: 'CS3551', subject: 'Distributed Computing', reg: '2021', sem: '5', depts: ['CSE'] },

        // CSE Sem 6
        { code: 'CCS356', subject: 'Object Oriented Software Engineering', reg: '2021', sem: '6', depts: ['CSE'] },
        { code: 'CS3691', subject: 'Embedded Systems and IoT', reg: '2021', sem: '6', depts: ['CSE'] },

        // CSE Sem 7
        { code: 'GE3791', subject: 'Human Values and Ethics', reg: '2021', sem: '7', depts: ['CSE', 'CIVIL', 'ECE', 'EEE', 'MECH', 'IT'] },

        // Civil Sem 2
        { code: 'BE3252', subject: 'Basic Electrical, Electronics and Instrumentation Engineering', reg: '2021', sem: '2', depts: ['CIVIL'] },
        { code: 'PH3201', subject: 'Physics for Civil Engineering', reg: '2021', sem: '2', depts: ['CIVIL'] },

        // Civil Sem 3
        { code: 'MA3351', subject: 'Transforms and Partial Differential Equations', reg: '2021', sem: '3', depts: ['CIVIL'] },
        { code: 'ME3351', subject: 'Engineering Mechanics', reg: '2021', sem: '3', depts: ['CIVIL'] },
        { code: 'CE3301', subject: 'Fluid Mechanics', reg: '2021', sem: '3', depts: ['CIVIL'] },
        { code: 'CE3351', subject: 'Surveying and Levelling', reg: '2021', sem: '3', depts: ['CIVIL'] },
        { code: 'CE3302', subject: 'Construction Materials and Technology', reg: '2021', sem: '3', depts: ['CIVIL'] },
        { code: 'CE3303', subject: 'Water Supply and WasteWater Engineering', reg: '2021', sem: '3', depts: ['CIVIL'] },

        // Civil Sem 4
        { code: 'CE3401', subject: 'Applied Hydraulics Engineering', reg: '2021', sem: '4', depts: ['CIVIL'] },
        { code: 'CE3402', subject: 'Strength of Materials', reg: '2021', sem: '4', depts: ['CIVIL'] },
        { code: 'CE3403', subject: 'Concrete Technology', reg: '2021', sem: '4', depts: ['CIVIL'] },
        { code: 'CE3404', subject: 'Soil Mechanics', reg: '2021', sem: '4', depts: ['CIVIL'] },
        { code: 'CE3405', subject: 'Highway and Railway Engineering', reg: '2021', sem: '4', depts: ['CIVIL'] },

        // Civil Sem 5
        { code: 'CE3501', subject: 'Design of Reinforced Concrete Structural Elements', reg: '2021', sem: '5', depts: ['CIVIL'] },
        { code: 'CE3502', subject: 'Structural Analysis I', reg: '2021', sem: '5', depts: ['CIVIL'] },
        { code: 'CE3503', subject: 'Foundation Engineering', reg: '2021', sem: '5', depts: ['CIVIL'] },

        // Civil Sem 6
        { code: 'CE3601', subject: 'Design of Steel Structural Elements', reg: '2021', sem: '6', depts: ['CIVIL'] },
        { code: 'AG3601', subject: 'Engineering Geology', reg: '2021', sem: '6', depts: ['CIVIL'] },
        { code: 'CE3602', subject: 'Structural Analysis II', reg: '2021', sem: '6', depts: ['CIVIL'] },

        // Civil Sem 7
        { code: 'AI3404', subject: 'Hydrology and Water Resources Engineering', reg: '2021', sem: '7', depts: ['CIVIL'] },
        { code: 'AI3404', subject: 'Estimation coasting and Valuation Engineering', reg: '2021', sem: '7', depts: ['CIVIL'] },
        { code: 'GE3752', subject: 'Total Quality Management', reg: '2021', sem: '7', depts: ['CIVIL'] }
    ];

    const CODE_REGEX = /[A-Z]{2,4}\d{3,4}/g;

    function extractCodesFromText(text, bucket) {
        if (!text) return;
        const matches = (text.toString().toUpperCase().match(CODE_REGEX)) || [];
        matches.forEach(c => bucket.add(c));
    }

    function collectSubjectCodes(subjectName, pdfs) {
        const codes = new Set();
        extractCodesFromText(subjectName, codes);
        (pdfs || []).forEach(pdf => {
            extractCodesFromText(pdf.name, codes);
            extractCodesFromText(pdf.path, codes);
        });

        const normalizedSubject = normalize(subjectName);
        SUBJECT_CODE_ENTRIES.forEach(entry => {
            if (normalize(entry.subject) === normalizedSubject) {
                codes.add(entry.code);
            }
        });

        return Array.from(codes);
    }

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

                        const subjectCodes = collectSubjectCodes(subjectName, subjectData.pdfs);
                        
                        // Build proper URL with query parameters
                        const subjectEncoded = encodeURIComponent(subjectName);
                        const baseUrl = `pages/pdfs.html?regulation=${regYear}&semester=${semNum}&subject=${subjectEncoded}`;
                        
                        // Check if this is a common semester 1 subject
                        const isCommonSem1 = semNum === '1' && commonSem1Subjects.some(cs => 
                            normalize(subjectName).includes(normalize(cs)) || 
                            normalize(cs).includes(normalize(subjectName))
                        );
                        
                        if (isCommonSem1) {
                            // Add separate entry for each department
                            allDepts.forEach(dept => {
                                items.push({
                                    label: `${subjectName}${subjectCodes.length ? ` [${subjectCodes.join('/')}]` : ''} (${dept})`,
                                    url: baseUrl,
                                    type,
                                    subject: subjectName,
                                    keywords: [subjectName, dept, `sem${semNum}`, `semester${semNum}`, regYear, ...subjectCodes],
                                    searchText: normalize(`${subjectName} ${dept} sem${semNum} semester ${semNum} ${regYear} ${subjectCodes.join(' ')}`)
                                });
                            });
                        } else {
                            // Regular subject - single entry
                            items.push({
                                label: `${subjectName}${subjectCodes.length ? ` [${subjectCodes.join('/')}]` : ''} (Sem ${semNum})`,
                                url: baseUrl,
                                type,
                                subject: subjectName,
                                keywords: [subjectName, `sem${semNum}`, `semester${semNum}`, regYear, ...subjectCodes],
                                searchText: normalize(`${subjectName} sem${semNum} semester ${semNum} ${regYear} ${subjectCodes.join(' ')}`)
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
                                            const subjectCodes = collectSubjectCodes(subjectName, papers);
                                            items.push({
                                                label: `${subjectName}${subjectCodes.length ? ` [${subjectCodes.join('/')}]` : ''} (${dept})`,
                                                url: '../question%20paper/question.html',
                                                type,
                                                subject: subjectName,
                                                keywords: [dept, subjectName, `sem${semNum}`, regYear, 'question', 'paper', 'pyq', ...subjectCodes],
                                                searchText: normalize(`${subjectName} ${dept} sem${semNum} ${regYear} question paper pyq ${subjectCodes.join(' ')}`)
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
            { url: 'assets/data/data.json', type: 'Notes' },
            { url: 'assets/data/sydata.json', type: 'Syllabus' },
            { url: 'assets/data/qn.json', type: 'Question Paper' }
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
            
            // Add department pages with multiple entry points
            const deptMapping = {
                'CSE': { name: 'Computer Science & Engineering', url: 'pages/cse.html' },
                'ECE': { name: 'Electronics & Communication', url: 'pages/ece.html' },
                'EEE': { name: 'Electrical & Electronics Engineering', url: 'pages/eee.html' },
                'MECH': { name: 'Mechanical Engineering', url: 'pages/mech.html' },
                'CIVIL': { name: 'Civil Engineering', url: 'pages/civil.html' },
                'IT': { name: 'Information Technology', url: 'pages/it.html' }
            };
            
            Object.entries(deptMapping).forEach(([code, info]) => {
                // Add multiple variations for better discoverability
                const variations = [
                    { label: `${code} Notes`, keywords: ['notes'] },
                    { label: `${code} Subjects`, keywords: ['subjects'] },
                    { label: `${code} - ${info.name}`, keywords: ['department', 'all'] }
                ];
                
                variations.forEach(variant => {
                    all.push({
                        label: variant.label,
                        url: info.url,
                        type: 'Department',
                        subject: info.name,
                        dept: code,
                        keywords: [code, info.name, ...variant.keywords],
                        searchText: normalize(`${code} ${info.name} ${variant.keywords.join(' ')}`)
                    });
                });
            });
            
            // Add CGPA/GPA Calculator entries
            all.push({
                label: 'CGPA Calculator',
                url: '../calculator.html#cgpa-panel',
                type: 'Tool',
                subject: 'CGPA Calculator',
                keywords: ['cgpa', 'calculator', 'cumulative', 'grade', 'point', 'average', 'calculate'],
                searchText: normalize('cgpa calculator cumulative grade point average calculate')
            });
            
            all.push({
                label: 'GPA Calculator',
                url: '../calculator.html#gpa-panel',
                type: 'Tool',
                subject: 'GPA Calculator',
                keywords: ['gpa', 'calculator', 'grade', 'point', 'average', 'calculate', 'semester'],
                searchText: normalize('gpa calculator grade point average calculate semester')
            });
            
            // Add all department subjects for Notes
            Object.entries(DEPT_SUBJECTS).forEach(([dept, regulations]) => {
                Object.entries(regulations).forEach(([regYear, semesters]) => {
                    Object.entries(semesters).forEach(([semNum, subjects]) => {
                        subjects.forEach(subjectName => {
                            if (!subjectName || subjectName.trim() === '') return;
                            const subjectEncoded = encodeURIComponent(subjectName);
                            all.push({
                                label: `${subjectName} (${dept} - Sem ${semNum})`,
                                url: `pages/pdfs.html?regulation=${regYear}&semester=${semNum}&subject=${subjectEncoded}`,
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

            // Add direct code-based entries for quick lookups (e.g., "HS3152 notes")
            SUBJECT_CODE_ENTRIES.forEach(entry => {
                const subjectEncoded = encodeURIComponent(entry.subject);
                const departments = entry.depts && entry.depts.length ? entry.depts : [entry.dept || 'ALL'];

                departments.forEach(dept => {
                    // Add Notes entry
                    all.push({
                        label: `${entry.code} — ${entry.subject}${dept && dept !== 'ALL' ? ` (${dept})` : ''}`,
                        url: `pages/pdfs.html?regulation=${entry.reg}&semester=${entry.sem}&subject=${subjectEncoded}`,
                        type: 'Notes',
                        subject: entry.subject,
                        dept: dept === 'ALL' ? undefined : dept,
                        keywords: [entry.code, entry.subject, dept, `sem${entry.sem}`, `semester${entry.sem}`, entry.reg, 'notes'],
                        searchText: normalize(`${entry.code} ${entry.subject} ${dept || ''} sem${entry.sem} semester ${entry.sem} ${entry.reg} notes`)
                    });
                    
                    // Add Question Paper entry
                    all.push({
                        label: `${entry.code} — ${entry.subject} PYQ${dept && dept !== 'ALL' ? ` (${dept})` : ''}`,
                        url: `../question%20paper/question.html`,
                        type: 'Question Paper',
                        subject: entry.subject,
                        dept: dept === 'ALL' ? undefined : dept,
                        keywords: [entry.code, entry.subject, dept, `sem${entry.sem}`, `semester${entry.sem}`, entry.reg, 'question', 'paper', 'pyq', 'previous', 'year'],
                        searchText: normalize(`${entry.code} ${entry.subject} ${dept || ''} sem${entry.sem} semester ${entry.sem} ${entry.reg} question paper pyq previous year`)
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
        const kws = item.keywords ? item.keywords.map(normalize) : [];
        
        for (const t of tokens) {
            // Exact keyword match gets highest priority
            if (kws.some(k => k === t)) {
                score += 100; // Much higher score for exact match
            }
            
            // Label exact match
            if (label === t) score += 50;
            else if (label.startsWith(t)) score += 4;
            else if (label.includes(t)) score += 2;
            
            // Keyword partial matches (only if not exact)
            if (kws.some(k => k.startsWith(t) && k !== t)) score += 3;
            else if (kws.some(k => k.includes(t) && k !== t)) score += 1;
            
            if (item.searchText && item.searchText.includes(t)) score += 1;
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

// -------------------- NAV HAMBURGER TOGGLE --------------------
function initNavToggle(){
    const navMenu = document.getElementById('primary-nav') || document.querySelector('.nav-menu');
    const toggleBtn = document.querySelector('.nav-toggle');
    const themeItem = navMenu ? navMenu.querySelector('.nav-theme-item') : null;
    if(!navMenu || !toggleBtn) return;

    function isMobileOrTablet(){
        return window.matchMedia('(max-width: 1024px)').matches;
    }

    function openMenu(){
        navMenu.classList.add('open');
        toggleBtn.setAttribute('aria-expanded','true');
    }
    function closeMenu(){
        navMenu.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded','false');
    }
    function toggleMenu(){
        if(!isMobileOrTablet()) return; // ignore on desktop
        if(navMenu.classList.contains('open')) closeMenu(); else openMenu();
    }

    toggleBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
        toggleMenu();
    });

    // Close when clicking outside
    document.addEventListener('click', (e)=>{
        if(!isMobileOrTablet()) return;
        if(!navMenu.classList.contains('open')) return;
        if(!navMenu.contains(e.target) && e.target !== toggleBtn) {
            closeMenu();
        }
    });

    // Close on ESC
    document.addEventListener('keydown', (e)=>{
        if(e.key === 'Escape' || e.key === 'Esc'){
            closeMenu();
        }
    });

    // Dark mode inside menu - let theme.js handle the toggle, we just close menu
    if(themeItem){
        // Don't preventDefault - let the theme.js listener work
        themeItem.addEventListener('click', (e)=>{
            // Close menu after a tiny delay to let theme.js toggle first
            setTimeout(()=> closeMenu(), 50);
        }, true); // use capture phase to run before theme.js listener
    }

    // Close when a nav link is clicked (but not the theme item)
    navMenu.querySelectorAll('.nav-link:not(.nav-theme-item)').forEach(link => {
        link.addEventListener('click', ()=>{
            closeMenu();
        });
    });

    // Reset state on resize back to desktop
    window.addEventListener('resize', ()=>{
        if(!isMobileOrTablet()){
            closeMenu();
        }
    });
}
// -------------------- CONTACT EMAIL HANDOFF --------------------
document.addEventListener('DOMContentLoaded', () => {
    initContactEmailLink();
    initStatsCounters();
});

function initContactEmailLink(){
    const emailLink = document.querySelector('.contact-email');
    if(!emailLink) return;

    const isMobileLike = () => {
        const ua = navigator.userAgent || '';
        const touchCapable = navigator.maxTouchPoints && navigator.maxTouchPoints > 1;
        const mobileUA = /android|iphone|ipad|ipod|windows phone/i.test(ua);
        const narrowScreen = Math.max(screen.width, screen.height) <= 900;
        return mobileUA || (touchCapable && narrowScreen);
    };

    const mobileHref = emailLink.getAttribute('data-mobile-href');
    const desktopHref = emailLink.getAttribute('data-desktop-href');
    const preferMobile = isMobileLike();

    emailLink.setAttribute('href', preferMobile && mobileHref ? mobileHref : desktopHref);

    if(preferMobile){
        emailLink.removeAttribute('target');
        emailLink.removeAttribute('rel');
    }
}

// -------------------- STATS COUNTERS --------------------
function initStatsCounters(){
    const statsSection = document.querySelector('.stats-section');
    if(!statsSection) return;

    const duration = 1200; // ms per counter

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                statsSection.querySelectorAll('.stat-item h4[data-target]').forEach(animateCounter);
                observer.unobserve(statsSection);
            }
        });
    }, { threshold: 0.5 });

    observer.observe(statsSection);

    function animateCounter(el){
        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const start = 0;
        let startTime = null;

        function step(timestamp){
            if(!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percent = Math.min(progress / duration, 1);
            const eased = easeOutQuad(percent);
            const value = Math.floor(start + (target - start) * eased);
            el.textContent = value + (percent === 1 ? suffix : '');
            el.classList.add('pop');
            setTimeout(() => el.classList.remove('pop'), 120);
            if(progress < duration){
                window.requestAnimationFrame(step);
            } else {
                el.textContent = target + suffix;
            }
        }

        window.requestAnimationFrame(step);
    }

    function easeOutQuad(t){
        return t * (2 - t);
    }
}
