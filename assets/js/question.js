
        // App State
        let universityData = {};
        let selectedDept = 'CSE';
        let selectedReg = '2021';
        let selectedSem = '1';
        let searchQuery = '';
        let expandedId = null;
        let currentPdfUrl = '';
        let currentPdfTitle = '';

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
                const response = await fetch('qn.json');
                universityData = await response.json();
                
                document.getElementById('year').textContent = new Date().getFullYear();
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
            
            document.getElementById('displayDeptName').textContent = deptFullNames[selectedDept] || selectedDept;
            document.getElementById('subjectCount').textContent = `${subjects.length} Subjects`;
            document.getElementById('emptyState').classList.toggle('hidden', subjects.length > 0);

            grid.innerHTML = subjects.map(s => {
                const isExp = expandedId === s.id;
                const available = s.papers.filter(p => p.pdf).length;
                return `
                    <div class="card ${isExp ? 'expanded' : ''}">
                        <div class="card-body" onclick="toggleCard('${s.id}')">
                            <div class="card-header">
                                <span class="sem-tag">SEM ${s.sem}</span>
                                <span class="reg-tag ${s.sem % 2 === 0 ? 'even' : 'odd'}">Reg ${selectedReg}</span>
                            </div>
                            <h3 style="font-size:1.125rem; line-height:1.3; font-weight:700;">${s.name}</h3>
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
            lucide.createIcons();
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
    