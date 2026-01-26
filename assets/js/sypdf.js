
    (function(){
      // Utility to read URL params - returns '' if not found
      function getParam(name) { const p = new URLSearchParams(window.location.search); return p.get(name) || ''; }

      // DOM refs
      const wholeGrid = document.getElementById('whole-grid');
      const semGrid = document.getElementById('sem-grid');
      const empty = document.getElementById('empty');
      const countBadge = document.getElementById('countBadge');
      const heading = document.getElementById('page-title');
      const breadcrumbReg = document.getElementById('breadcrumb-reg');
      const breadcrumbDept = document.getElementById('breadcrumb-dept');
      const regSelect = document.getElementById('filter-reg');
      
      const defaultReg = '2021';
      const dept = (getParam('dept') || 'CSE').toUpperCase();
      // Mapping of department codes to full human-friendly names
      const deptNames = {
        'CSE': 'Computer Science and Engineering',
        'ECE': 'Electronics & Communication Engineering',
        'EEE': 'Electrical & Electronics Engineering',
        'MECH': 'Mechanical Engineering',
        'CIVIL': 'Civil Engineering',
        'IT': 'Information Technology'
      };
      const deptFull = deptNames[dept] || dept;
      let selectedReg = (getParam('regulation') || defaultReg);

      // Initialize UI
      regSelect.value = selectedReg;
      breadcrumbDept.textContent = dept;
      breadcrumbReg.textContent = selectedReg;
      // Use en-dash for display: CSE – Regulation 2021
      heading.textContent = `${deptFull} – Regulation ${selectedReg}`;
      // Set document title dynamically for better UX
      document.title = `${deptFull} | Regulation ${selectedReg} — LearnSkart`;

      // CSS classes for disabled action buttons
      const style = document.createElement('style');
      style.textContent = `
        .btn-view.disabled, .btn-download.disabled{ opacity: .5; pointer-events: none; cursor: default; }
        .type-badge{ display:inline-block; margin-left:8px; font-size:12px; padding:4px 8px; border-radius:999px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; }
      `;
      document.head.appendChild(style);

      // Fetch sydata.json and render according to structured schema
      async function fetchAndRender() {
        wholeGrid.innerHTML = '';
        semGrid.innerHTML = '';
        empty.style.display = 'none';
        countBadge.textContent = 0;

        let data;
        try {
          const resp = await fetch('../assets/data/sydata.json', { cache: 'no-store' });
          if (!resp.ok) throw new Error('Failed to load demo.json');
          data = await resp.json();
        } catch (err) {
          console.error(err);
          empty.style.display = '';
          return;
        }

        // data is expected to be an object keyed by department: { CSE: { '2021': { whole, semesters } }, ... }
        if (!data || typeof data !== 'object') {
          empty.style.display = '';
          return;
        }

        const deptData = data[dept];
        if (!deptData) {
          // department not found
          empty.style.display = '';
          return;
        }

        const regData = deptData[selectedReg] || {};

        // Section A: whole syllabus
        if (regData.whole && (regData.whole.pdf !== undefined || regData.whole.title)) {
          const sectionTitle = document.createElement('h2');
          sectionTitle.className = 'whole-section-title section-title';
          sectionTitle.innerHTML = '<i class="fas fa-book-open"></i> Whole Syllabus';

          // Wrap heading and grid in a section wrapper so it visually matches semester sections
          const wrap = document.createElement('div');
          wrap.className = 'semester-section';

          const grid = document.createElement('div');
          grid.className = 'pdf-grid';
          const card = createWholeCard(regData.whole);
          grid.appendChild(card);

          wrap.appendChild(sectionTitle);
          wrap.appendChild(grid);
          wholeGrid.appendChild(wrap);
        }

        // Section B: semester grouped
        const semesters = {};
        // Preferred structure: regData.semesters = { '1': [..], '2': [..] }
        if (regData.semesters && typeof regData.semesters === 'object') {
          Object.keys(regData.semesters).forEach(k => { semesters[k] = regData.semesters[k]; });
        }
        // Support alternate structure: keys like 'Semester 1' or '1'
        Object.keys(regData).forEach(k => {
          if (k === 'whole' || k === 'semesters') return;
          if (Array.isArray(regData[k])) {
            // Normalize key to number if possible: 'Semester 1' or '1'
            const semNumber = String(k).replace(/[^0-9]/g,'') || k;
            semesters[semNumber] = regData[k];
          }
        });

        const semKeys = Object.keys(semesters).sort((a,b) => parseInt(a,10) - parseInt(b,10));
        if (semKeys.length) {
          // Create a section wrapper to match the 'Whole Syllabus' layout
          const semTitle = document.createElement('h2');
          semTitle.className = 'semester-section-title section-title';
          semTitle.innerHTML = '<i class="fas fa-layer-group"></i> Semester-wise';

          const semRoot = document.createElement('div');
          semRoot.className = 'semester-section';

          const semList = document.createElement('div');
          semList.className = 'sem-list';

          semKeys.forEach(sem => {
            // Create a visually grouped block per semester for better alignment
            const semWrap = document.createElement('div');
            semWrap.className = 'semester-section';

            const semHeading = document.createElement('h3');
            semHeading.className = 'semester-heading';
            semHeading.textContent = 'Semester ' + sem;

            const row = document.createElement('div');
            row.className = 'pdf-grid';
            const arr = Array.isArray(semesters[sem]) ? semesters[sem] : [];
            arr.forEach(sub => row.appendChild(createSubjectCard(sub, sem)));

            semWrap.appendChild(semHeading);
            semWrap.appendChild(row);
            semList.appendChild(semWrap);
          });

          semRoot.appendChild(semTitle);
          semRoot.appendChild(semList);
          semGrid.appendChild(semRoot);
        }

        // Update counts
        let total = 0;
        total += regData.whole ? 1 : 0;
        semKeys.forEach(sem => { total += Array.isArray(semesters[sem]) ? semesters[sem].length : 0; });
        countBadge.textContent = total;
        empty.style.display = total ? 'none' : '';
      }

      // helper: format filename -> human-friendly display
      function formatDisplayName(filename) {
        if (!filename) return '';
        // strip query/hash and extension
        const core = filename.split(/[?#]/)[0].replace(/\.[^/.]+$/, '');
        // replace separators with space and collapse multiple spaces
        const spaced = core.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
        // title-case words - lowercase first, then capitalize each word
        return spaced.split(' ').map(w => w ? (w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) : '').join(' ');
      }

      // create whole syllabus card
      function createWholeCard(w) {
        const pdf = w && w.pdf ? w.pdf : '';
        const title = (w && w.title) ? w.title : 'Complete Syllabus';
        const card = document.createElement('div');
        card.className = 'pdf-card';
        const header = document.createElement('div'); header.className = 'pdf-header';
        header.innerHTML = `<div class="pdf-icon"><i class="fas fa-book"></i></div>`;
        const info = document.createElement('div'); info.className = 'pdf-info';
        const name = document.createElement('div'); name.className = 'pdf-name'; name.textContent = title;
        const meta = document.createElement('div'); meta.className = 'pdf-meta'; meta.textContent = `${dept} / Regulation ${selectedReg}`;
        info.appendChild(name); info.appendChild(meta);
        header.appendChild(info); card.appendChild(header);
        const footer = document.createElement('div'); footer.className = 'pdf-footer';
        const view = document.createElement('a'); view.className = 'btn-view'; view.textContent = 'View';
        const dl = document.createElement('a'); dl.className = 'btn-download'; dl.textContent = 'Download';
    if (!pdf) {
          view.classList.add('disabled'); view.href = '#'; view.setAttribute('aria-disabled', 'true'); view.tabIndex = -1;
          dl.classList.add('disabled'); dl.href = '#'; dl.setAttribute('aria-disabled', 'true'); dl.tabIndex = -1;
        } else {
          // For Google Drive URLs, use viewer. For local files, open directly
          if (pdf.includes('drive.google.com')) {
            view.href = pdf.replace('/uc?id=', '/file/d/') + '/preview'; view.target = '_blank'; view.rel = 'noopener';
            dl.href = pdf; dl.target = '_blank'; dl.rel = 'noopener';
          } else {
            // Normalize paths: sypdf.html lives inside `syllabus/` so remove leading `syllabus/` if present
            const href = pdf.startsWith('syllabus/') ? pdf.replace(/^syllabus\//, '') : pdf;
            view.href = href; view.target = '_blank'; view.rel = 'noopener';
            dl.href = href; dl.download = href.split('/').pop() || '';
          }
        }
        footer.appendChild(view); footer.appendChild(dl); card.appendChild(footer);
        return card;
      }

      // create subject card with type badge
      function createSubjectCard(item, semester) {
        const pdf = item.pdf || '';
        const subject = (item.title || item.subject) ? (item.title || item.subject) : 'Subject PDF';
        const type = item.type || (item.lab ? 'Lab' : 'Theory');
        const card = document.createElement('div'); card.className = 'pdf-card';
        const header = document.createElement('div'); header.className = 'pdf-header';
        header.innerHTML = `<div class="pdf-icon"><i class="fas fa-file-pdf"></i></div>`;
        const info = document.createElement('div'); info.className = 'pdf-info';
        const name = document.createElement('div'); name.className = 'pdf-name'; name.textContent = subject;
        const typeBadge = document.createElement('span'); typeBadge.className = 'type-badge'; typeBadge.textContent = type;
        name.appendChild(typeBadge);
        const meta = document.createElement('div'); meta.className = 'pdf-meta'; meta.textContent = `${dept} / sem ${semester} / Regulation ${selectedReg}`;
        info.appendChild(name); info.appendChild(meta);
        header.appendChild(info); card.appendChild(header);
        const footer = document.createElement('div'); footer.className = 'pdf-footer';
        const view = document.createElement('a'); view.className = 'btn-view'; view.textContent = 'View';
        const dl = document.createElement('a'); dl.className = 'btn-download'; dl.textContent = 'Download';
    if (!pdf) {
          view.classList.add('disabled'); view.href = '#'; view.setAttribute('aria-disabled', 'true'); view.tabIndex = -1;
          dl.classList.add('disabled'); dl.href = '#'; dl.setAttribute('aria-disabled', 'true'); dl.tabIndex = -1;
        } else {
          // For Google Drive URLs, use viewer. For local files, open directly
          if (pdf.includes('drive.google.com')) {
            view.href = pdf.replace('/uc?id=', '/file/d/') + '/preview'; view.target = '_blank'; view.rel = 'noopener';
            dl.href = pdf; dl.target = '_blank'; dl.rel = 'noopener';
          } else {
            // For pages inside `syllabus/`, strip leading folder prefix so links resolve correctly
            const href = pdf.startsWith('syllabus/') ? pdf.replace(/^syllabus\//, '') : pdf;
            view.href = href; view.target = '_blank'; view.rel = 'noopener';
            dl.href = href; dl.download = href.split('/').pop() || '';
          }
        }
        footer.appendChild(view); footer.appendChild(dl); card.appendChild(footer);
        return card;
      }

      // Function to handle regulation change (now automatically triggers fetch)
      function handleRegulationChange() {
        selectedReg = regSelect.value || defaultReg;
        breadcrumbReg.textContent = selectedReg;
        heading.textContent = `${deptFull} – Regulation ${selectedReg}`;
        document.title = `${deptFull} | Regulation ${selectedReg} — LearnSkart`;
        // update URL param (non-breaking) without reloading the page
        const params = new URLSearchParams(window.location.search);
        params.set('regulation', selectedReg);
        const newUrl = window.location.pathname + '?' + params.toString();
        window.history.replaceState({}, '', newUrl);
        fetchAndRender();
      }

      // Attach event listener directly to the select element
      regSelect.addEventListener('change', handleRegulationChange);

      // Apply and Reset buttons logic (now redundant and removed from HTML)
      // Kept the default initialization logic
      
      // initialize
      fetchAndRender();
    })();
