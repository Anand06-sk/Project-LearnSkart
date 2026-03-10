
        const deptPages = [
            { dept: 'CSE', path: '../anna-university-notes/cse/index.html' },
            { dept: 'ECE', path: '../anna-university-notes/ece/index.html' },
            { dept: 'EEE', path: '../anna-university-notes/eee/index.html' },
            { dept: 'IT', path: '../anna-university-notes/it/index.html' },
            { dept: 'MECH', path: '../anna-university-notes/mech/index.html' },
            { dept: 'CIVIL', path: '../anna-university-notes/civil/index.html' }
        ];

        let subjectNameToCode = {};
        let subjectCodeToInfo = {};
        let templateCodeMap = {};
        let templateFolderMap = {};

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

        function normalizeSubjectCode(str) {
            if (!str) return '';
            return String(str).toUpperCase().replace(/[^A-Z0-9]/g, '');
        }

        function extractCodeFromText(str) {
            if (!str) return '';
            const text = String(str).toUpperCase();

            const ignoredPrefixes = new Set(['AM', 'PM', 'ND', 'FN', 'AN', 'AQ', 'QP']);
            const pattern = /\b([A-Z]{2,5})\s*-?\s*(\d{4})\b/g;
            let match;

            while ((match = pattern.exec(text)) !== null) {
                const prefix = match[1];
                const digits = match[2];
                const year = Number(digits);

                // Ignore exam-session/year tokens like AM-2024 or ND2023.
                if (ignoredPrefixes.has(prefix) && year >= 2000 && year <= 2099) {
                    continue;
                }

                return normalizeSubjectCode(`${prefix}${digits}`);
            }

            return '';
        }

        function inferFolderFromPaperTitle(title) {
            if (!title) return '';
            const text = String(title);
            const code = extractCodeFromText(text);
            if (!code) return '';

            const lower = text.toLowerCase();
            const previousYearPattern = lower.match(/-\s*([a-z]{2,5}\s*-?\s*\d{4})-([a-z0-9-]+)-previous-year-question-papers/i);
            if (previousYearPattern && previousYearPattern[2]) {
                const rawSlug = String(previousYearPattern[2]).toLowerCase().replace(/-+/g, '-').replace(/^-|-$/g, '');
                const slug = removeLeadingCodeFromSlug(rawSlug, code);
                return slug ? `${code}-${slug}` : '';
            }

            const codeMatch = text.match(/([A-Za-z]{2,5}\s*-?\s*\d{4})/);
            if (!codeMatch || typeof codeMatch.index !== 'number') return '';

            let rest = text.slice(codeMatch.index + codeMatch[0].length);
            rest = rest.replace(/^[\s\-_:]+/, '');
            rest = rest.replace(/\.pdf$/i, '');

            const splitById = rest.split(/-\d{3,}.*/i)[0];
            const splitByMeta = splitById.split(/-(?:apr|may|nov|dec|question|paper|download|am|nd|202\d)\b/i)[0];
            const slug = removeLeadingCodeFromSlug(slugifySubjectName(splitByMeta), code);
            if (!slug) return '';

            return `${code}-${slug}`;
        }

        function slugifySubjectName(str) {
            if (!str) return '';
            return String(str)
                .toLowerCase()
                .replace(/&/g, ' and ')
                .replace(/\([^)]*\)/g, ' ')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
        }

        function removeLeadingCodeFromSlug(subjectSlug, subjectCode) {
            const slug = String(subjectSlug || '').toLowerCase().replace(/-+/g, '-').replace(/^-|-$/g, '');
            const code = normalizeSubjectCode(subjectCode || '');
            if (!slug || !code) return slug;

            const compactCode = code.toLowerCase();
                const splitCode = compactCode.replace(/^([a-z]{2,5})(\d{4})$/, '$1-$2');

            if (slug === compactCode || slug === splitCode) return '';
            if (slug.startsWith(`${compactCode}-`)) return slug.slice(compactCode.length + 1);
            if (slug.startsWith(`${splitCode}-`)) return slug.slice(splitCode.length + 1);
            return slug;
        }

        function inferPyqFolder(subjectCode, subjectName, papers) {
            const normalizedCode = normalizeSubjectCode(subjectCode);
            const folderOverrides = {
                HS3152: 'HS3152-professional-english-1',
                HS3252: 'HS3252-professional-english-ii',
                CS3501: 'CS3501-complier-design'
            };
            if (normalizedCode && folderOverrides[normalizedCode]) {
                return folderOverrides[normalizedCode];
            }

            if (Array.isArray(papers) && papers.length > 0) {
                const inferredFromAnyTitle = papers
                    .map(p => inferFolderFromPaperTitle(p && p.title ? p.title : ''))
                    .find(Boolean);
                if (inferredFromAnyTitle) return inferredFromAnyTitle;

                const firstPaperTitle = papers[0].title || '';
                const inferredFromLooseTitle = extractCodeFromText(firstPaperTitle);
                const cleanedSubjectSlug = removeLeadingCodeFromSlug(slugifySubjectName(subjectName), inferredFromLooseTitle);
                if (inferredFromLooseTitle && cleanedSubjectSlug) {
                    return `${inferredFromLooseTitle}-${cleanedSubjectSlug}`;
                }
            }

            const slug = removeLeadingCodeFromSlug(slugifySubjectName(subjectName), normalizedCode);
            if (normalizedCode && slug) return `${normalizedCode}-${slug}`;
            if (normalizedCode) return normalizedCode;
            return '';
        }

        function normalizeFolderName(str) {
            return String(str || '').replace(/-+/g, '-').replace(/^-|-$/g, '');
        }

        function enforceFolderCodeCase(folder) {
            const value = String(folder || '');
            return value.replace(/^([a-z]{2,5}\d{4})(?=-|$)/i, (_, code) => code.toUpperCase());
        }

        function buildTemplateFolder(row) {
            const subjectCode = normalizeSubjectCode(row.subject_code || '');
            const subjectSlug = removeLeadingCodeFromSlug(slugifySubjectName(row.subject_name || ''), subjectCode);

            const fromPaperTitle = Array.isArray(row.papers)
                ? (row.papers.map(p => inferFolderFromPaperTitle(p && p.title ? p.title : '')).find(Boolean) || '')
                : '';
            if (fromPaperTitle) return normalizeFolderName(fromPaperTitle);

            const folderOverrides = {
                HS3152: 'HS3152-professional-english-1',
                HS3252: 'HS3252-professional-english-ii',
                CS3501: 'CS3501-complier-design'
            };
            if (subjectCode && folderOverrides[subjectCode]) return folderOverrides[subjectCode];

            if (subjectCode && subjectSlug) return normalizeFolderName(`${subjectCode}-${subjectSlug}`);
            return '';
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

        function buildTemplateMaps(rows) {
            const codeMap = {};
            const folderMap = {};
            if (!Array.isArray(rows)) return { codeMap, folderMap };
            rows.forEach(row => {
                const dept = String(row.dept_code || '').toUpperCase();
                const sem = normalizeSemester(row.semester || '');
                const name = normalizeSubjectName(row.subject_name || '');
                const code = normalizeSubjectCode(row.subject_code || '');
                if (!dept || !sem || !name) return;
                const key = `${dept}|${sem}|${name}`;
                if (code) codeMap[key] = code;

                const folder = buildTemplateFolder(row);
                if (folder) folderMap[key] = folder;
            });
            return { codeMap, folderMap };
        }

        function getTemplateCode(dept, sem, subjectName) {
            const key = `${String(dept || '').toUpperCase()}|${normalizeSemester(sem || '')}|${normalizeSubjectName(subjectName || '')}`;
            return templateCodeMap[key] || '';
        }

        function getTemplateFolder(dept, sem, subjectName) {
            const key = `${String(dept || '').toUpperCase()}|${normalizeSemester(sem || '')}|${normalizeSubjectName(subjectName || '')}`;
            return templateFolderMap[key] || '';
        }

        function normalizeSemester(sem) {
            if (!sem) return '';
            let s = String(sem).trim().toUpperCase();
            const romanMap = { 'VIII':'8','VII':'7','VI':'6','V':'5','IV':'4','III':'3','II':'2','I':'1' };
            const num = s.match(/\b([1-8])\b/);
            if (num) return num[1];
            const roman = s.match(/\b(VIII|VII|VI|V|IV|III|II|I)\b/);
            if (roman) return romanMap[roman[1]];
            const anyDigit = s.match(/([1-8])/);
            if (anyDigit) return anyDigit[1];
            return s;
        }

        function normalizeRegulation(reg) {
            if (!reg) return '2021';
            const s = String(reg);
            const year = s.match(/(20\d{2})/);
            if (year) return year[1];
            const digits = s.replace(/\D/g, '');
            return digits || '2021';
        }

        // App State
        let universityData = {};
        let selectedDept = 'CSE';
        let selectedReg = '2021';
        let selectedSem = '1';
        let searchQuery = '';
        let expandedId = null;
        let currentPdfUrl = '';
        let currentPdfTitle = '';
        let targetSubjectNormalized = '';
        let didAutoFocus = false;
        let didSearchFocus = false;
        let searchTriggered = false;

        const deptFullNames = {
            "CSE": "Computer Science and Engineering",
            "ECE": "Electronics and Communication Engineering",
            "EEE": "Electrical and Electronics Engineering",
            "MECH": "Mechanical Engineering",
            "CIVIL": "Civil Engineering",
            "IT": "Information Technology"
        };

        const deptSearchAliases = {
            CSE: ['cse', 'computer science', 'computer science engineering', 'computer science and engineering'],
            ECE: ['ece', 'electronics and communication', 'electronics communication', 'electronics'],
            EEE: ['eee', 'electrical and electronics', 'electrical electronics', 'electrical'],
            IT: ['it', 'information technology', 'information tech'],
            MECH: ['mech', 'mechanical', 'mechanical engineering'],
            CIVIL: ['civil', 'civil engineering']
        };

        function normalizeSearchText(str) {
            if (!str) return '';
            return String(str).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        }

        function getMatchedDepartmentsFromQuery(query) {
            const normalizedQuery = normalizeSearchText(query);
            if (!normalizedQuery) return [];

            return Object.entries(deptSearchAliases)
                .filter(([, aliases]) => aliases.some(alias => normalizedQuery.includes(alias)))
                .map(([dept]) => dept);
        }

        // Initialize
        async function init() {
            try {
                // Fetch your JSON file
                const response = await fetch('../assets/data/qn.json');
                universityData = await response.json();

                const tplResp = await fetch('../assets/data/pyq-templates.json');
                const tplData = await tplResp.json();
                const maps = buildTemplateMaps(tplData);
                templateCodeMap = maps.codeMap;
                templateFolderMap = maps.folderMap;

            await loadSubjectCodeMaps();
                
                document.getElementById('year').textContent = new Date().getFullYear();
                const deptRaw = getParam('dept');
                const semRaw = getParam('semester') || getParam('sem');
                const regRaw = getParam('regulation') || getParam('reg');
                const subjectRaw = getParam('subject') || getParam('sub');

                if (deptRaw) selectedDept = deptRaw.toUpperCase();
                if (semRaw) selectedSem = normalizeSemester(semRaw) || selectedSem;
                if (regRaw) selectedReg = normalizeRegulation(regRaw) || selectedReg;
                if (subjectRaw) targetSubjectNormalized = normalizeSubjectName(subjectRaw);

                renderTabs();
                renderSemesterTabs();
                renderGrid();
                document.getElementById('loader').classList.add('hidden');
            } catch (e) {
                console.error("Data error:", e);
                document.getElementById('loader').innerHTML = "Error loading content.";
            }
        }

        function renderTabs(){
            const tabs = document.getElementById('deptTabs');
            tabs.innerHTML = Object.keys(universityData).map(dept => `
                <button class="tab-btn ${selectedDept === dept ? 'active' : ''}" onclick="setDept('${dept}')">
                    ${dept}
                </button>
            `).join('');
        }

        function renderSemesterTabs() {
            const tabs = document.getElementById('semTabs');
            const semesters = ['1', '2', '3', '4', '5', '6', '7'];
            tabs.innerHTML = semesters.map(sem => `
                <button class="tab-btn ${selectedSem === sem ? 'active' : ''}" onclick="setSem('${sem}')">
                    Sem ${sem}
                </button>
            `).join('');
        }

        function renderGrid() {
            const grid = document.getElementById('grid');
            const cards = Array.from(grid.querySelectorAll('.qp-card'));
            let visibleCards = [];
            let autoExpandedId = null;
            let searchExpandedId = null;
            const query = (searchQuery || '').trim();
            const hasSearch = Boolean(query);
            const searchNormalized = normalizeSubjectName(query);
            const searchCode = normalizeSubjectCode(query);
            const searchText = normalizeSearchText(query);
            const searchAcrossSem = hasSearch;
            const matchedDepts = getMatchedDepartmentsFromQuery(query);

            const allDepartments = Object.keys(universityData);
            const departmentsToScan = hasSearch
                ? (matchedDepts.length ? matchedDepts : allDepartments)
                : [selectedDept];

            if (selectedReg === '2025') {
                document.getElementById('grid').classList.add('hidden');
                document.getElementById('emptyState').classList.add('hidden');
                document.getElementById('comingSoonState').classList.remove('hidden');
                document.getElementById('displayDeptName').textContent = deptFullNames[selectedDept] || selectedDept;
                document.getElementById('subjectCount').textContent = '0 Subjects';
                cards.forEach(card => card.classList.add('hidden'));
                lucide.createIcons();
                return;
            }

            document.getElementById('grid').classList.remove('hidden');
            document.getElementById('comingSoonState').classList.add('hidden');

            cards.forEach(card => {
                const dept = (card.dataset.dept || '').toUpperCase();
                const sem = String(card.dataset.sem || '');
                const name = card.dataset.name || '';
                const subjectNormalized = card.dataset.nameNormalized || normalizeSubjectName(name);
                const subjectCodeNormalized = card.dataset.code || '';
                const deptText = normalizeSearchText(`${dept} ${deptFullNames[dept] || ''}`);
                const nameText = normalizeSearchText(name);

                const deptMatch = departmentsToScan.includes(dept);
                const semMatch = searchAcrossSem || selectedSem === 'All' || sem === selectedSem;
                const matchesSearch = !hasSearch
                    || (searchNormalized && (subjectNormalized.includes(searchNormalized) || searchNormalized.includes(subjectNormalized)))
                    || (searchCode && subjectCodeNormalized && (subjectCodeNormalized.includes(searchCode) || searchCode.includes(subjectCodeNormalized)))
                    || (searchText && (nameText.includes(searchText) || deptText.includes(searchText)));

                const isVisible = deptMatch && semMatch && matchesSearch;
                card.classList.toggle('hidden', !isVisible);
                if (!isVisible) {
                    card.classList.remove('expanded', 'is-focus');
                    return;
                }

                visibleCards.push(card);
                if (!searchExpandedId && searchTriggered && hasSearch) {
                    searchExpandedId = card.dataset.subjectId || null;
                }
            });

            if (!didAutoFocus && targetSubjectNormalized) {
                const match = visibleCards.find(card => {
                    const subjectNormalized = card.dataset.nameNormalized || '';
                    return subjectNormalized === targetSubjectNormalized
                        || subjectNormalized.includes(targetSubjectNormalized)
                        || targetSubjectNormalized.includes(subjectNormalized);
                });
                autoExpandedId = match ? (match.dataset.subjectId || null) : null;
                if (autoExpandedId && !expandedId) {
                    expandedId = autoExpandedId;
                }
            }

            if (searchExpandedId) {
                expandedId = searchExpandedId;
            }

            const displayDeptName = hasSearch
                ? (departmentsToScan.length === 1
                    ? (deptFullNames[departmentsToScan[0]] || departmentsToScan[0])
                    : 'All Departments')
                : (deptFullNames[selectedDept] || selectedDept);

            document.getElementById('displayDeptName').textContent = displayDeptName;
            document.getElementById('subjectCount').textContent = `${visibleCards.length} ${hasSearch ? 'Results' : 'Subjects'}`;
            document.getElementById('emptyState').classList.toggle('hidden', visibleCards.length > 0);

            visibleCards.forEach(card => {
                const cardId = card.dataset.subjectId || '';
                const isTarget = targetSubjectNormalized && (() => {
                    const subjectNormalized = card.dataset.nameNormalized || '';
                    return subjectNormalized === targetSubjectNormalized
                        || subjectNormalized.includes(targetSubjectNormalized)
                        || targetSubjectNormalized.includes(subjectNormalized);
                })();
                const isExp = expandedId ? expandedId === cardId : autoExpandedId === cardId;
                card.classList.toggle('expanded', Boolean(isExp));
                card.classList.toggle('is-focus', Boolean(isTarget));

                const chevron = card.querySelector('[data-lucide="chevron-down"], .lucide-chevron-down');
                if (chevron) {
                    chevron.style.transform = isExp ? 'rotate(180deg)' : 'none';
                }
            });

            grid.querySelectorAll('.subject-link').forEach(link => {
                if (link.dataset.boundClick === '1') return;
                link.addEventListener('click', e => e.stopPropagation());
                link.dataset.boundClick = '1';
            });

            lucide.createIcons();

            if (autoExpandedId && !didAutoFocus) {
                const focusCard = grid.querySelector('.card.is-focus');
                if (focusCard) {
                    requestAnimationFrame(() => {
                        focusCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    });
                }
                didAutoFocus = true;
            }

            if (searchExpandedId && !didSearchFocus) {
                const focusCard = grid.querySelector(`.card[data-subject-id="${searchExpandedId}"]`);
                if (focusCard) {
                    requestAnimationFrame(() => {
                        focusCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    });
                }
                didSearchFocus = true;
                searchTriggered = false;
            }
        }

        // Event Handlers
        window.setDept = (dept) => {
            selectedDept = dept;
            didSearchFocus = false;
            searchTriggered = false;
            renderTabs();
            renderGrid();
        };

        window.setSem = (sem) => {
            selectedSem = sem;
            didSearchFocus = false;
            searchTriggered = false;
            renderSemesterTabs();
            renderGrid();
        };

        window.setReg = (reg, btn) => {
            selectedReg = reg;
            document.querySelectorAll('.reg-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            didSearchFocus = false;
            searchTriggered = false;
            renderGrid();
        };

        window.toggleCard = (id) => {
            const card = Array.from(document.querySelectorAll('.qp-card')).find(c => (c.dataset.subjectId || '') === id);
            const link = card ? card.querySelector('.subject-link') : null;
            if (link && link.href) {
                window.location.href = link.href;
            }
        };

        document.getElementById('searchInput').oninput = (e) => {
            searchQuery = e.target.value;
            expandedId = null;
            didSearchFocus = false;
            searchTriggered = false;
            renderGrid();
        };

        document.getElementById('searchInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                runSearch();
            }
        });

        document.getElementById('searchBtn').addEventListener('click', () => {
            runSearch();
        });

        function runSearch() {
            searchQuery = document.getElementById('searchInput').value;
            expandedId = null;
            didSearchFocus = false;
            searchTriggered = true;
            renderGrid();
        }

        window.openPdf = (url, title, event) => {
            if (event) event.stopPropagation();
            currentPdfUrl = url;
            currentPdfTitle = title;
            // Convert Google Drive link to embeddable format
            let embedUrl = url;
            if (url.includes('drive.google.com/uc?id=')) {
                const fileId = url.split('id=')[1];
                embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
            }
            document.getElementById('pdfFrame').src = embedUrl;
            document.getElementById('modalTitle').textContent = title;
            document.getElementById('pdfModal').classList.remove('hidden');
        };

        window.downloadPdf = (url, title, event) => {
            if (event) event.stopPropagation();
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
        };

        window.downloadCurrentPdf = () => {
            if (!currentPdfUrl) return;
            window.downloadPdf(currentPdfUrl, currentPdfTitle || 'paper');
        };

        window.closeModal = (e) => {
            document.getElementById('pdfModal').classList.add('hidden');
            document.getElementById('pdfFrame').src = "";
            currentPdfUrl = '';
            currentPdfTitle = '';
        };

        init();
    