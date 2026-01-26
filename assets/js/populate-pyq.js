const fs = require('fs');
const path = require('path');

// Read existing qn.json
const qnPath = path.join(__dirname, 'qn.json');
let universityData = JSON.parse(fs.readFileSync(qnPath, 'utf8'));

const pyqPath = path.join(__dirname, 'PYQ');

// Mapping of department folder names to keys
const deptMapping = {
  'CSE': 'CSE',
  'ECE': 'ECE',
  'EEE': 'EEE',
  'CIVIL': 'CIVIL',
  'MECH': 'MECH',
  'IT': 'IT'
};

// Function to extract year from filename
function extractYear(filename) {
  const yearMatch = filename.match(/\b(20\d{2})\b/);
  return yearMatch ? yearMatch[1] : '2021';
}

// Function to normalize subject name (handles variations, typos, plurals)
function normalizeSubjectName(name) {
  if (!name) return '';
  return name
    .replace(/\([^)]*\)/g, '') // remove (codes)
    .replace(/[^a-zA-Z0-9\s&]/g, ' ') // strip punctuation
    .replace(/\s+/g, ' ') // collapse spaces
    .trim()
    .toLowerCase()
    // normalize roman numerals commonly used for parts I/II/III
    .replace(/\bii\b/g, '2')
    .replace(/\bi\b/g, '1')
    .replace(/\biii\b/g, '3')
    .replace(/\biv\b/g, '4')
    .replace(/\benglish\s*-?\s*ii\b/g, 'english 2')
    .replace(/\benglish\s*-?\s*i\b/g, 'english 1')
    .replace(/\bmatrice?s\b/g, 'matrices')
    .replace(/\bcalculus\b/g, 'calculus')
    .replace(/\bphysics\b/g, 'physics')
    .replace(/\bchemistry\b/g, 'chemistry')
    .replace(/\bdata\s*structure(s)?\b/g, 'data structures')
    .replace(/\brandom\s*process(es)?\b/g, 'random processes');
}

function tokenize(name) {
  const stop = new Set(['and', '&', 'of', 'for', 'in', 'to', 'the']);
  return normalizeSubjectName(name)
    .split(' ')
    .filter(w => w && !stop.has(w))
    // drop course codes like HS3152, MA3101, etc.
    .filter(w => !/[a-zA-Z]{2,}\d{2,}/.test(w));
}

// Function to find matching subject in qn.json
function jaccardScore(aTokens, bTokens) {
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  const intersection = [...a].filter(x => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union ? intersection / union : 0;
}

// Token overlap: measures containment of tokens between sets
function tokenOverlap(aTokens, bTokens) {
  if (!aTokens.length || !bTokens.length) return 0;
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  const inter = [...a].filter(x => b.has(x)).length;
  const fracA = inter / a.size;
  const fracB = inter / b.size;
  return Math.min(fracA, fracB);
}

// simple normalized string includes check
function nameIncludes(aName, bName) {
  const a = normalizeSubjectName(aName);
  const b = normalizeSubjectName(bName);
  return a.includes(b) || b.includes(a);
}

// Levenshtein distance for fuzzy string matching
function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function similarity(a, b) {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1.0;
  const editDistance = levenshtein(shorter, longer);
  return (longer.length - editDistance) / longer.length;
}

// Find best matching subject in qn.json using token similarity
function findMatchingSubject(subjects, folderName) {
  const fTokens = tokenize(folderName);
  const fNorm = normalizeSubjectName(folderName);
  let best = { subject: null, score: 0 };

  for (const subject of subjects) {
    const sTokens = tokenize(subject);
    const sNorm = normalizeSubjectName(subject);
    
    // Token-based scores
    const jac = jaccardScore(fTokens, sTokens);
    const ovl = tokenOverlap(fTokens, sTokens);
    
    // String similarity for typos/missing letters
    const strSim = similarity(fNorm, sNorm);
    
    // Blended score favoring string similarity for close matches
    const score = 0.3 * jac + 0.2 * ovl + 0.5 * strSim;
    
    if (score > best.score) best = { subject, score };
  }

  // Accept if similar enough (lowered threshold for typos)
  if (best.score >= 0.35) return best.subject;

  // Fallback: substring includes
  for (const subject of subjects) {
    if (nameIncludes(subject, folderName)) return subject;
  }

  return null;
}

// Scan PYQ folder
function scanPYQ() {
  if (!fs.existsSync(pyqPath)) {
    console.log('PYQ folder not found');
    return;
  }

  const depts = fs.readdirSync(pyqPath);
  
  depts.forEach(dept => {
    const deptPath = path.join(pyqPath, dept);
    if (!fs.statSync(deptPath).isDirectory()) return;
    
    const deptKey = deptMapping[dept];
    if (!deptKey) {
      console.log(`Skipping unmapped department: ${dept}`);
      return;
    }
    
    // Ensure department exists in universityData
    if (!universityData[deptKey]) {
      universityData[deptKey] = { '2021': {} };
    }
    
    const semesterFolders = fs.readdirSync(deptPath);
    
    semesterFolders.forEach(semFolder => {
      const semPath = path.join(deptPath, semFolder);
      if (!fs.statSync(semPath).isDirectory()) return;
      
      // Extract semester number
      const semMatch = semFolder.match(/\d+/);
      const semNum = semMatch ? semMatch[0] : null;
      
      if (!semNum) return;
      
      // Get all regulations in the department
      const regulations = Object.keys(universityData[deptKey]);
      
      regulations.forEach(reg => {
        if (!universityData[deptKey][reg][semNum]) {
          universityData[deptKey][reg][semNum] = {};
        }
        
        const subjects = fs.readdirSync(semPath);
        
        subjects.forEach(subject => {
          const subjectPath = path.join(semPath, subject);
          if (!fs.statSync(subjectPath).isDirectory()) return;
          
          // Find matching subject in qn.json
          const qnSubjects = Object.keys(universityData[deptKey][reg][semNum] || {});
          const matchedSubject = findMatchingSubject(qnSubjects, subject);
          
          if (!matchedSubject) {
            console.log(`No match found for: ${deptKey} > Sem ${semNum} > ${subject}`);
            return;
          }
          
          // Scan files in subject folder
          const files = fs.readdirSync(subjectPath).filter(f => {
            const ext = path.extname(f).toLowerCase();
            return ext === '.pdf' || ext === '.doc' || ext === '.docx';
          });
          
          // Replace with current scan to prevent duplicates/drift
          const newEntries = files.map(file => {
            const year = extractYear(file);
            const filePath = `PYQ/${dept}/Sem ${semNum}/${subject}/${file}`;
            return { title: `${year} - ${file}`, year, pdf: filePath };
          });

          universityData[deptKey][reg][semNum][matchedSubject] = newEntries;
          
          console.log(`✓ ${deptKey} > Sem ${semNum} > ${matchedSubject}: ${files.length} files`);
        });
      });
    });
  });
}

// Main execution
console.log('Starting PYQ population...\n');
scanPYQ();

// Save updated data
fs.writeFileSync(qnPath, JSON.stringify(universityData, null, 2));
console.log('\n✓ qn.json updated successfully!');
