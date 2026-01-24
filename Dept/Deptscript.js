// Regulation default + info display
(function() {
  const regSelect = document.getElementById('reg');
  const regInfo = document.getElementById('reg-info');
  if (regSelect) {
    // Default to 2021 if nothing selected
    if (!regSelect.value) regSelect.value = '2021';
    if (regInfo) regInfo.textContent = `Current Regulation: ${regSelect.value}`;

    // Update on change (visual only). Actual application occurs when Search is clicked.
    regSelect.addEventListener('change', function() {
      // Visual highlight only
      regSelect.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.4), 0 0 25px rgba(102, 126, 234, 0.6)';
      regSelect.style.borderColor = 'rgba(102, 126, 234, 0.9)';
      regSelect.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(240, 244, 255, 0.95))';

      setTimeout(() => {
        regSelect.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        regSelect.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        regSelect.style.background = '#ffffff';
      }, 700);
    });
  }
})();

// Handle semester selection
(function() {
  const semSelect = document.getElementById('sem');
  if (!semSelect) return;

  function scrollToSection(el) {
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 0;
    const rect = el.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    // Position the section just below the sticky header with a small gap
    const top = Math.max(absoluteTop - headerHeight - 20, 0);
    window.scrollTo({ top, behavior: 'smooth' });
  }

  semSelect.addEventListener('change', function() {
    // Visual highlight only; actual scroll/highlight happens on Search
    semSelect.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.4), 0 0 25px rgba(102, 126, 234, 0.6)';
    semSelect.style.borderColor = 'rgba(102, 126, 234, 0.9)';
    semSelect.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(240, 244, 255, 0.95))';

    setTimeout(() => {
      semSelect.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      semSelect.style.borderColor = 'rgba(255, 255, 255, 0.3)';
      semSelect.style.background = '#ffffff';
    }, 700);
  });
})();

function searchNotes() {
  const regSelect = document.getElementById('reg');
  const semSelect = document.getElementById('sem');

  if (!regSelect || !semSelect || !regSelect.value || !semSelect.value) {
    showToast('Please select Regulation and Semester before searching.', 'error');
    return;
  }

  const regVal = regSelect.value;
  const semVal = semSelect.value;

  // Update top regulation badge and swap content areas
  const regInfo = document.getElementById('reg-info');
  if (regInfo) regInfo.textContent = `Current Regulation: ${regVal}`;

  const content2021 = document.getElementById('content-2021');
  const content2025 = document.getElementById('content-2025');
  const comingSoon = document.getElementById('coming-soon');
  if (regVal === '2025') {
    if (content2021) content2021.style.display = 'none';
    if (content2025) content2025.style.display = 'none';
    if (comingSoon) comingSoon.classList.remove('hidden');
    showToast('2025 regulation materials are coming soon.', 'success');
    return;
  }

  if (comingSoon) comingSoon.classList.add('hidden');
  if (content2021) content2021.style.display = 'flex';
  if (content2025) content2025.style.display = 'none';

  // Find the target section inside the visible content area
  const containerId = regVal === '2025' ? 'content-2025' : 'content-2021';
  const targetSection = document.querySelector(`#${containerId} #semester-${semVal}`);
  if (targetSection) {
    // Remove active class from all sections and add to target
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    targetSection.classList.add('active');

    // Optional branding update
    const logo = document.querySelector('.logo');
    if (logo) logo.innerHTML = '<i class="fas fa-book"></i> LearnSkart';

    // Scroll to the section accounting for sticky header
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 0;
    const rect = targetSection.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const top = Math.max(absoluteTop - headerHeight - 20, 0);
    window.scrollTo({ top, behavior: 'smooth' });

    // Show unobtrusive confirmation
    showToast(`Showing ${regVal} — Semester ${semVal}`, 'success');
  }
}

// Make note cards clickable and navigate to pdfs.html
(function () {
  function addClickHandlers() {
    document.querySelectorAll('.note-card').forEach(card => {
      if (card.dataset.clickBound === '1') return;
      card.dataset.clickBound = '1';
      card.style.cursor = 'pointer';
      card.addEventListener('click', function () {
        const subject = this.textContent.trim();
        // derive semester from closest section id (like "semester-1")
        let semester = '';
        const section = this.closest('.section');
        if (section && section.id && section.id.startsWith('semester-')) {
          semester = section.id.split('-')[1];
        } else {
          semester = document.getElementById('sem') ? document.getElementById('sem').value : '';
        }

        const regulation = document.getElementById('reg') ? document.getElementById('reg').value : '2021';

        if (!semester) {
          alert('Please select a semester first (use the Semester dropdown) or click the subject inside its semester section.');
          return;
        }

        // Extract department from page header or title
        const deptElement = document.querySelector('.page-header h1');
        let dept = 'CIVIL';
        if (deptElement) {
          const title = deptElement.textContent.toUpperCase();
          // Prefer exact phrases and unique identifiers first
          if (title.includes('ELECTRICAL AND ELECTRONICS')) dept = 'EEE';
          else if (title.includes('MECH') || title.includes('MECHANICAL')) dept = 'MECH';
          else if (title.includes('CSE') || title.includes('COMPUTER')) dept = 'CSE';
          else if (title.includes('ECE') || title.includes('ELECTRONICS') || title.includes('COMMUNICATION')) dept = 'ECE';
          else if (title.includes('IT') || title.includes('INFORMATION')) dept = 'IT';
          else if (title.includes('CIVIL')) dept = 'CIVIL';
        }

        const params = new URLSearchParams({
          regulation: regulation,
          semester: semester,
          subject: subject,
          dept: dept
        });

        // Navigate to pdfs page
        window.location.href = '../pdfs/pdfs.html?' + params.toString();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addClickHandlers);
  } else {
    addClickHandlers();
  }

  window.addEventListener('load', addClickHandlers);
})();

// Apply saved dark mode preference
(function applySavedTheme() {
  try {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) document.body.classList.add('dark-mode');
  } catch (e) {}
})();

// Toast helper, placeholder removal, persistence and UI flash
(function() {
  const reg = document.getElementById('reg');
  const sem = document.getElementById('sem');
  const searchBtn = document.querySelector('.search-btn');

  // Toast utilities
  function getToastContainer() {
    let c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      c.className = 'toast-container';
      document.body.appendChild(c);
    }
    return c;
  }

  window.showToast = function(message, type = 'success', timeout = 3000) {
    try {
      const container = getToastContainer();
      const t = document.createElement('div');
      t.className = 'toast ' + (type || '');
      t.textContent = message;
      container.appendChild(t);
      // show
      requestAnimationFrame(() => t.classList.add('show'));
      // remove after timeout
      setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 250);
      }, timeout);
    } catch (e) { console.warn('toast failed', e); }
  };

  function removePlaceholderOnce(selectEl) {
    if (!selectEl) return;
    const onFirstFocus = function() {
      const firstOpt = selectEl.querySelector('option[value=""]');
      if (firstOpt) firstOpt.remove();
      selectEl.removeEventListener('focus', onFirstFocus);
    };
    selectEl.addEventListener('focus', onFirstFocus, { once: true });
  }

  removePlaceholderOnce(reg);
  removePlaceholderOnce(sem);

  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      // persist selections
      try { if (reg) localStorage.setItem('opennotes_reg', reg.value); } catch(e) {}
      try { if (sem) localStorage.setItem('opennotes_sem', sem.value); } catch(e) {}

      // flash reg-info when applied
      const regInfo = document.getElementById('reg-info');
      if (regInfo) {
        regInfo.classList.remove('flash');
        void regInfo.offsetWidth; // force reflow
        regInfo.classList.add('flash');
      }
    });
  }

  // Restore saved values on load (but do not auto-apply them)
  try {
    const savedReg = localStorage.getItem('opennotes_reg');
    const savedSem = localStorage.getItem('opennotes_sem');
    if (reg && savedReg) reg.value = savedReg;
    if (sem && savedSem) sem.value = savedSem;
  } catch (e) {}
})();