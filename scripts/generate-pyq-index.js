const fs = require('fs');
const path = require('path');

// Define department mapping
const deptMap = {
  'civil': {
    label: 'Civil Engineering',
    icon: 'Building2',
    prefixes: ['AG', 'CE', 'GE', 'MA', 'PH', 'HS', 'CY']
  },
  'cse': {
    label: 'Computer Science and Engineering',
    icon: 'Code',
    prefixes: ['CS', 'CD', 'CCS', 'GE', 'MA', 'IT3401']
  },
  'ece': {
    label: 'Electronics and Communication Engineering',
    icon: 'Radio',
    prefixes: ['EC', 'EE', 'GE', 'MA', 'PH', 'HS']
  },
  'eee': {
    label: 'Electrical and Electronics Engineering',
    icon: 'Zap',
    prefixes: ['EE', 'GE', 'MA', 'PH', 'HS']
  },
  'it': {
    label: 'Information Technology',
    icon: 'Cpu',
    prefixes: ['IT', 'CS', 'CD', 'GE', 'MA']
  },
  'mech': {
    label: 'Mechanical Engineering',
    icon: 'Wrench',
    prefixes: ['ME', 'GE', 'MA', 'PH', 'HS']
  }
};

// Get all subject folders
function getSubjects() {
  const pyqDir = path.join(__dirname, '../pyq');
  const dirs = fs.readdirSync(pyqDir).filter(name => {
    const fullPath = path.join(pyqDir, name);
    return fs.statSync(fullPath).isDirectory() && 
           !['civil', 'cse', 'ece', 'eee', 'it', 'mech'].includes(name);
  });
  
  return dirs.sort();
}

// Categorize subjects by department
function categorizeSubjects(subjects) {
  const grouped = {
    civil: [],
    cse: [],
    ece: [],
    eee: [],
    it: [],
    mech: [],
    other: []
  };

  subjects.forEach(subject => {
    const code = subject.match(/^[A-Z]+/)?.[0] || '';
    let placed = false;
    
    for (const [dept, config] of Object.entries(deptMap)) {
      if (config.prefixes.some(prefix => code.startsWith(prefix))) {
        grouped[dept].push(subject);
        placed = true;
        break;
      }
    }
    
    if (!placed) grouped.other.push(subject);
  });

  return grouped;
}

// Generate HTML
function generateHTML(grouped) {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LearnSkart - Previous Question Papers</title>
    <meta name="description" content="Browse and download previous year question papers for all Anna University engineering subjects. Organized by department and regulation.">
    <meta name="keywords" content="previous year questions, Anna University, PYQ, exam papers, engineering, Civil, CSE, ECE, EEE, IT, Mechanical">
    <link rel="canonical" href="https://anand06-sk.github.io/Project-LearnSkart/previous-year-questions/">
    <link rel="icon" href="../assets/icons/favicon.ico" type="image/x-icon">
    <link rel="apple-touch-icon" href="../assets/icons/apple-touch-icon.png">
    <link rel="manifest" href="../assets/icons/site.webmanifest">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../assets/css/question.css">
    
    <style>
        .section-container { margin: 3rem 0; }
        .section-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid var(--border); }
        .section-header .icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); color: white; border-radius: 8px; font-size: 1.25rem; }
        .section-header h2 { margin: 0; font-size: 1.75rem; font-weight: 700; color: var(--text-primary); }
        .subjects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
        .subject-card { padding: 1.5rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; transition: all 0.3s ease; text-decoration: none; color: inherit; display: flex; flex-direction: column; }
        .subject-card:hover { background: var(--bg-tertiary); border-color: var(--primary); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .subject-card .code { font-size: 0.875rem; color: var(--primary); font-weight: 700; margin-bottom: 0.5rem; }
        .subject-card .name { font-size: 1rem; font-weight: 600; color: var(--text-primary); text-transform: capitalize; margin-bottom: 0.5rem; }
        .subject-card .arrow { color: var(--primary); margin-left: 0.5rem; }
        .empty-dept { color: var(--muted); padding: 2rem 1rem; text-align: center; border-radius: 8px; background: var(--bg-secondary); }
    </style>
</head>
<body>
<script src="../assets/js/theme.js" defer></script>

    <nav class="nav">
        <div class="container nav-inner">
            <div class="logo-wrap">
                <div class="logo-icon"><img src="../assets/icons/favicon-96x96.png" alt="LearnSkart Logo" class="logo-img"></div>
                <div class="logo-text">
                    <h1>LearnSkart</h1>
                    <p>Question Papers</p>
                </div>
            </div>
            <div class="nav-links">
                <a href="../">Home</a>
                <a href="../index.html#contact">Contact</a>
                <a href="../about/">About</a>
            </div>
        </div>
    </nav>

    <section class="hero">
        <div class="hero-bg"></div>
        <div class="container">
            <span class="badge">Academic Resource Portal</span>
            <h1 class="hero-title">Find Your <span class="text-blue">Previous Papers</span></h1>
            <p class="hero-desc">Access a comprehensive collection of previous year question papers for all engineering departments. Organized by department, easily searchable, and ready to download.</p>
        </div>
    </section>

    <main class="main container">
        <div class="content-header">
            <h2 style="margin: 0;">Browse by Department</h2>
        </div>

${Object.entries(deptMap).map(([key, dept]) => {
  const subjects = grouped[key] || [];
  return `
        <div class="section-container">
            <div class="section-header">
                <div class="icon"><i data-lucide="${dept.icon}"></i></div>
                <h2>${dept.label}</h2>
                <span style="margin-left: auto; color: var(--muted); font-size: 0.875rem;">${subjects.length} subjects</span>
            </div>
            ${subjects.length > 0 ? `
            <div class="subjects-grid">
${subjects.map(subject => {
  const [code, ...nameParts] = subject.split('-');
  const name = nameParts.join(' ');
  return `                <a href="../pyq/${subject}/" class="subject-card">
                    <div class="code">${code}</div>
                    <div class="name">${name}</div>
                    <div style="margin-top: auto; color: var(--primary); display: flex; align-items: center;">
                        View Papers <span class="arrow">→</span>
                    </div>
                </a>`;
}).join('\n')}
            </div>
            ` : `<div class="empty-dept">No subjects available</div>`}
        </div>
`}).join('')}

    </main>

    <footer class="footer">
        <div class="container">
            <div class="footer-logo"><img src="../assets/icons/favicon-96x96.png" alt="LearnSkart Logo" class="logo-img"> LearnSkart</div>
            <p style="color:var(--muted); font-size:0.875rem; margin-bottom:2rem;">Designed to help students excel by providing easy access to academic resources.</p>
            <div style="font-size:0.75rem; color:#94a3b8; text-align: center;">© <span id="year"></span> LearnSkart. All rights reserved. Made with <i class="fas fa-heart"></i> for students.</div>
        </div>
    </footer>

    <script>
        document.getElementById('year').textContent = new Date().getFullYear();
        lucide.createIcons();
    </script>
</body>
</html>`;

  return htmlContent;
}

// Main
const subjects = getSubjects();
const grouped = categorizeSubjects(subjects);
const html = generateHTML(grouped);

const outputPath = path.join(__dirname, '../previous-year-questions/index.html');
fs.writeFileSync(outputPath, html, 'utf8');
console.log(`✓ Generated ${outputPath}`);
console.log(`  - Total subjects: ${subjects.length}`);
Object.entries(grouped).forEach(([dept, subs]) => {
  if (subs.length > 0) console.log(`  - ${dept}: ${subs.length} subjects`);
});
