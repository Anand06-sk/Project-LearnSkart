
    function getParam(name) {
      const p = new URLSearchParams(window.location.search);
      return p.get(name) || '';
    }

    function normalizeDept(code) {
      if (!code) return 'CSE';
      const c = code.toUpperCase();
      if (c === 'EEE') return 'EEE';
      if (c === 'ECE') return 'ECE';
      if (c === 'MECH') return 'MECH';
      if (c === 'CIVIL') return 'CIVIL';
      if (c === 'IT') return 'IT';
      if (c === 'CSE') return 'CSE';
      return c;
    }

    function deptPath(code) {
      const c = normalizeDept(code);
      const map = {
        'CSE': '../Dept/cse.html',
        'ECE': '../Dept/ece.html',
        'EEE': '../Dept/eee.Html',
        'MECH': '../Dept/mech.html',
        'CIVIL': '../Dept/civil.html',
        'IT': '../Dept/it.html'
      };
      return map[c] || '../Dept/cse.html';
    }

    function safeDecode(raw) {
      try { return decodeURIComponent(raw); } catch(e) { return raw; }
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function toDriveView(url) {
      if (!url) return url;
      const m = url.match(/[?&]id=([^&]+)/) || url.match(/\/d\/([^/]+)/) || url.match(/uc\/(?:export=download)?\?id=([^&]+)/);
      if (m && m[1]) {
        return 'https://drive.google.com/file/d/' + m[1] + '/preview';
      }
      return url;
    }

    function createCardHTML(pdf) {
      const rawUrl = pdf.url || pdf.path || '#';
      const viewUrl = toDriveView(rawUrl);
      const name = escapeHtml(pdf.name || 'PDF file');
      return `
        <div class="pdf-card" data-view="${viewUrl}" role="link" tabindex="0">
          <div class="pdf-header">
            <div class="pdf-icon"><i class="fas fa-file-pdf"></i></div>
            <div class="pdf-info">
              <div class="pdf-name">${name}</div>
            </div>
          </div>
          <div class="pdf-footer">
            <a class="action-btn view-btn" href="${viewUrl}" target="_blank" rel="noopener noreferrer">
              <i class="fas fa-eye"></i> View
            </a>
            <a class="action-btn download-btn" href="${rawUrl}" download>
              <i class="fas fa-download"></i> Download
            </a>
          </div>
        </div>
      `;
    }

    function normalizeSubjectName(str) {
      if (!str) return '';
      let s = String(str);
      // Drop subject codes in parentheses, e.g., (HS3152)
      s = s.replace(/\([^)]*\)/g, ' ');
      // Normalize dashes to spaces
      s = s.replace(/[–—-]/g, ' ');
      // Convert common roman numerals (I..VIII) to digits for matching
      const romanMap = {
        'VIII': '8', 'VII': '7', 'VI': '6', 'V': '5', 'IV': '4', 'III': '3', 'II': '2', 'I': '1'
      };
      s = s.replace(/\b(VIII|VII|VI|IV|III|II|I)\b/gi, m => romanMap[m.toUpperCase()] || m);
      // Unify ampersand
      s = s.replace(/&/g, 'and');
      // Remove all non-alphanumerics and lowercase
      return s.toLowerCase().replace(/[^a-z0-9]/g, '');
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
      // fallback to digits-only if present
      const digits = s.replace(/\D/g, '');
      return digits || '2021';
    }

    function findSubjectNode(semNode, subject) {
      if (!semNode || !subject) return null;
      if (semNode[subject]) return semNode[subject];

      const target = normalizeSubjectName(subject);
      if (!target) return null;

      const keys = Object.keys(semNode);
      const normalizedMap = keys.reduce((acc, k) => {
        acc[k] = normalizeSubjectName(k);
        return acc;
      }, {});

      // Exact normalized match
      const exactKey = keys.find(k => normalizedMap[k] === target);
      if (exactKey) return semNode[exactKey];

      // Partial contains match
      const partialKey = keys.find(k => normalizedMap[k].includes(target) || target.includes(normalizedMap[k]));
      if (partialKey) return semNode[partialKey];

      return null;
    }

    function collectPdfsFromSem(semNode, targetNormalized) {
      const out = [];
      const keys = Object.keys(semNode || {});
      for (const k of keys) {
        const node = semNode[k];
        if (!node || !Array.isArray(node.pdfs)) continue;
        if (!targetNormalized) {
          out.push(...node.pdfs);
          continue;
        }
        const nk = normalizeSubjectName(k);
        if (nk.includes(targetNormalized) || targetNormalized.includes(nk)) {
          out.push(...node.pdfs);
        }
      }
      return out;
    }

    async function loadPDFs() {
      const deptRaw = getParam('dept');
      const dept = normalizeDept(deptRaw) || 'CSE';
      const regulationRaw = (getParam('regulation') || getParam('reg') || '2021').trim();
      const regulation = normalizeRegulation(regulationRaw);
      const semesterRaw = (getParam('semester') || getParam('sem') || '').trim();
      const semester = normalizeSemester(semesterRaw);
      const subjectRaw = getParam('subject') || getParam('sub');
      const subject = subjectRaw ? safeDecode(subjectRaw).trim() : '';

      const backLink = document.getElementById('back-dept');
      const backLabel = document.getElementById('back-dept-label');
      if (backLink) backLink.href = deptPath(dept);
      if (backLabel) backLabel.textContent = `Back to ${dept}`;

      document.getElementById('breadcrumb-dept').textContent = dept || '-';
      document.getElementById('breadcrumb-reg').textContent = regulation || '-';
      document.getElementById('breadcrumb-sem').textContent = semester || '-';
      document.getElementById('breadcrumb-sub').textContent = subject || '-';
      if (subject) document.getElementById('page-title').textContent = subject + ' — PDFs';

      let data;
      try {
        const resp = await fetch('data.json', {cache:'no-store'});
        if (!resp.ok) throw new Error('Could not load data.json');
        data = await resp.json();
      } catch (err) {
        console.error('Failed to load data.json', err);
        const empty = document.getElementById('empty');
        const title = empty?.querySelector('h2');
        const msg = empty?.querySelector('p');
        if (title) title.textContent = 'Unable to load data';
        if (msg) msg.innerHTML = 'I couldn\'t read data.json. If you\'re opening this file directly, please run a local server and open via http://. For VS Code, use the Live Server extension.';
        showEmpty();
        return;
      }

      const deptNode = data[dept] || data[dept.toUpperCase()] || data[dept.toLowerCase()];
      const semNode = deptNode?.[regulation]?.[semester];
      const subjectNode = findSubjectNode(semNode, subject);
      let pdfs = [];

      // If a subject is specified, show ONLY that subject's PDFs.
      if (subject) {
        if (subjectNode?.pdfs?.length) {
          pdfs = subjectNode.pdfs;
        } else {
          showEmpty();
          return;
        }
      } else {
        // If no subject is provided, fall back to listing the entire semester.
        if (semNode) {
          pdfs = collectPdfsFromSem(semNode, '');
        }
      }

      const grid = document.getElementById('pdf-grid');
      const empty = document.getElementById('empty');
      const countBadge = document.getElementById('countBadge');

      if (!pdfs.length) {
        showEmpty();
        return;
      }

      empty.style.display = 'none';
      grid.style.display = 'grid';

      pdfs.sort((a,b) => (a.name||'').localeCompare(b.name||''));
      grid.innerHTML = pdfs.map(p => createCardHTML(p)).join('');
      // Make entire card clickable to open the view URL
      grid.querySelectorAll('.pdf-card').forEach(card => {
        const openView = () => {
          const url = card.getAttribute('data-view');
          if (url && url !== '#') window.open(url, '_blank', 'noopener');
        };
        card.addEventListener('click', (e) => {
          if ((e.target instanceof Element) && e.target.closest('a')) return; // let buttons work
          openView();
        });
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openView();
          }
        });
      });
      countBadge.textContent = pdfs.length;
    }

    function showEmpty() {
      document.getElementById('pdf-grid').style.display = 'none';
      document.getElementById('empty').style.display = 'block';
      document.getElementById('countBadge').textContent = 0;
    }

    // Apply saved dark mode preference
    (function applySavedTheme() {
      try {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) document.body.classList.add('dark-mode');
      } catch (e) {}
    })();

    window.addEventListener('load', loadPDFs);
  