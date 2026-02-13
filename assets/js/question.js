
        const deptPages = [
            { dept: 'CSE', path: '../academics/cse/index.html' },
            { dept: 'ECE', path: '../academics/ece/index.html' },
            { dept: 'EEE', path: '../academics/eee/index.html' },
            { dept: 'IT', path: '../academics/it/index.html' },
            { dept: 'MECH', path: '../academics/mech/index.html' },
            { dept: 'CIVIL', path: '../academics/civil/index.html' }
        ];

        let subjectNameToCode = {};
        let subjectCodeToInfo = {};

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

        const deptFullNames = {
            "CSE": "Computer Science & Engineering",
            "ECE": "Electronics & Communication",
            "EEE": "Electrical & Electronics",
            "MECH": "Mechanical Engineering",
            "CIVIL": "Civil Engineering",
            "IT": "Information Technology"
        };

        // Initialize
        async function init() {
            try {
                // Fetch your JSON file
                const response = await fetch('../assets/data/qn.json');
                universityData = await response.json();

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
            const data = universityData[selectedDept]?.[selectedReg] || {};
            let subjects = [];
            let autoExpandedId = null;

            // Check if 2025 regulation is selected and show coming soon state
            if (selectedReg === '2025') {
                document.getElementById('grid').classList.add('hidden');
                document.getElementById('emptyState').classList.add('hidden');
                document.getElementById('comingSoonState').classList.remove('hidden');
                document.getElementById('displayDeptName').textContent = deptFullNames[selectedDept] || selectedDept;
                document.getElementById('subjectCount').textContent = '0 Subjects';
                lucide.createIcons();
                return;
            }

            // Reset states for other regulations
            document.getElementById('grid').classList.remove('hidden');
            document.getElementById('comingSoonState').classList.add('hidden');

            Object.entries(data).forEach(([sem, items]) => {
                if (selectedSem === 'All' || sem === selectedSem) {
                    Object.entries(items).forEach(([name, papers]) => {
                        if (!searchQuery || name.toLowerCase().includes(searchQuery.toLowerCase())) {
                            subjects.push({ id: `${selectedDept}-${sem}-${name}`, sem, name, papers });
                        }
                    });
                }
            });

            subjects.sort((a, b) => a.sem - b.sem);

            if (!didAutoFocus && targetSubjectNormalized) {
                const match = subjects.find(s => {
                    const subjectNormalized = normalizeSubjectName(s.name);
                    return subjectNormalized === targetSubjectNormalized || subjectNormalized.includes(targetSubjectNormalized) || targetSubjectNormalized.includes(subjectNormalized);
                });
                autoExpandedId = match ? match.id : null;
                if (autoExpandedId && !expandedId) {
                    expandedId = autoExpandedId;
                }
            }
            
            document.getElementById('displayDeptName').textContent = deptFullNames[selectedDept] || selectedDept;
            document.getElementById('subjectCount').textContent = `${subjects.length} Subjects`;
            document.getElementById('emptyState').classList.toggle('hidden', subjects.length > 0);

            grid.innerHTML = subjects.map(s => {
                const subjectNormalized = normalizeSubjectName(s.name);
                const isTarget = targetSubjectNormalized && (subjectNormalized === targetSubjectNormalized || subjectNormalized.includes(targetSubjectNormalized) || targetSubjectNormalized.includes(subjectNormalized));
                const isExp = expandedId ? expandedId === s.id : autoExpandedId === s.id;
                const available = s.papers.filter(p => p.pdf).length;
                const subjectCode = subjectNameToCode[subjectNormalized] || '';
                const subjectMeta = subjectCode ? `
                            <div class="subject-meta">
                                <span class="subject-code">${subjectCode}</span>
                                <a class="subject-link" href="../pyq.html?code=${encodeURIComponent(subjectCode)}">View Question Papers</a>
                            </div>
                        ` : '';
                return `
                    <div class="card ${isExp ? 'expanded' : ''} ${isTarget ? 'is-focus' : ''}">
                        <div class="card-body" onclick="toggleCard('${s.id}')">
                            <div class="card-header">
                                <span class="sem-tag">SEM ${s.sem}</span>
                                <span class="reg-tag ${s.sem % 2 === 0 ? 'even' : 'odd'}">Reg ${selectedReg}</span>
                            </div>
                            <h3 style="font-size:1.125rem; line-height:1.3; font-weight:700;">${s.name}</h3>
                            ${subjectMeta}
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.25rem;">
                                <span style="font-size:0.75rem; color:var(--muted); display:flex; gap:4px; align-items:center;">
                                    <i data-lucide="file-text" style="width:14px"></i> ${available} Papers available
                                </span>
                                <i data-lucide="chevron-down" style="width:16px; transition:0.3s; transform:${isExp?'rotate(180deg)':'none'}"></i>
                            </div>
                        </div>
                        ${isExp ? `
                            <div class="papers-list">
                                ${s.papers.map(p => `
                                    <div class="paper-item">
                                        <div style="overflow:hidden">
                                            <div style="font-weight:600; font-size:0.875rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.title}</div>
                                            <div style="font-size:0.75rem; color:var(--muted); display:flex; gap:4px; align-items:center;">
                                                <i data-lucide="calendar" style="width:12px"></i> ${p.year}
                                            </div>
                                        </div>
                                        <div style="display:flex; gap:4px">
                                            <button class="btn-icon" onclick="openPdf('${p.pdf}', '${p.title}', event)"><i data-lucide="eye" style="width:18px"></i></button>
                                            <button class="btn-icon" style="color:white; background:var(--primary);" onclick="downloadPdf('${p.pdf}', '${p.title}', event)"><i data-lucide="download" style="width:16px"></i></button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
            grid.querySelectorAll('.subject-link').forEach(link => {
                link.addEventListener('click', e => e.stopPropagation());
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
        }

        // Event Handlers
        window.setDept = (dept) => {
            selectedDept = dept;
            renderTabs();
            renderGrid();
        };

        window.setSem = (sem) => {
            selectedSem = sem;
            renderSemesterTabs();
            renderGrid();
        };

        window.setReg = (reg, btn) => {
            selectedReg = reg;
            document.querySelectorAll('.reg-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderGrid();
        };

        window.toggleCard = (id) => {
            expandedId = expandedId === id ? null : id;
            renderGrid();
        };

        document.getElementById('searchInput').oninput = (e) => {
            searchQuery = e.target.value;
            renderGrid();
        };

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
    