
(function() {
    try {
        var theme = localStorage.getItem('site-theme') || 'light';
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark-mode');
        }
    } catch (e) {}
})();

(function(){
    var paths = ['Home/theme.js','./theme.js','../theme.js','../../theme.js'];
    paths.forEach(function(p){ var s=document.createElement('script'); s.src=p; s.defer=true; s.onerror=function(){}; document.head.appendChild(s); });
})();

const GRADE_POINTS = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'U': 0 };
let cgpaSemesterCount = 0;
let creditData = {};

const regulationFilter = document.getElementById('regulation-filter');
const departmentFilter = document.getElementById('department-filter');
const semesterFilter = document.getElementById('semester-filter');
const gpaSubjectsContainer = document.getElementById('gpa-subjects');
const gpaFilterNote = document.getElementById('gpa-filter-note');
let manualSubjectCount = 0;

document.getElementById('year').textContent = new Date().getFullYear();

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');

        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

        this.classList.add('active');
        document.getElementById(tabName + '-panel').classList.add('active');
    });
});

function createOptions(selectEl, values, formatLabel) {
    selectEl.innerHTML = '';
    values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = formatLabel ? formatLabel(value) : value;
        selectEl.appendChild(option);
    });
}

function getNumericSemValue(semKey) {
    const number = parseInt(String(semKey).replace(/[^0-9]/g, ''), 10);
    return Number.isNaN(number) ? 999 : number;
}

function titleCaseDepartment(dept) {
    if (!dept) return '';
    const labels = {
        Mech: 'MECH',
        Civil: 'CIVIL'
    };
    if (labels[dept]) return labels[dept];
    if (dept.toUpperCase() === dept) return dept;
    return dept.charAt(0).toUpperCase() + dept.slice(1).toLowerCase();
}

function renderEmptySubjects(message) {
    gpaSubjectsContainer.innerHTML = `<div class="empty-state">${message}</div>`;
}

function getGradeSelectOptions() {
    return `
        <option value="" selected disabled>Select</option>
        <option value="O">O</option>
        <option value="A+">A+</option>
        <option value="A">A</option>
        <option value="B+">B+</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="U">U</option>
    `;
}

function refreshSubjectIndex() {
    const rows = document.querySelectorAll('#gpa-subjects .subject-row.gpa-row');
    rows.forEach((row, index) => {
        const indexEl = row.querySelector('.subject-index');
        if (indexEl) indexEl.textContent = `#${index + 1}`;
    });
}

function removeManualSubject(id) {
    const row = document.getElementById(id);
    if (row) {
        row.remove();
        refreshSubjectIndex();
    }
}

function addManualSubject() {
    if (gpaSubjectsContainer.querySelector('.empty-state')) {
        gpaSubjectsContainer.innerHTML = '';
    }

    manualSubjectCount += 1;
    const rowId = `manual-subject-${manualSubjectCount}`;
    const row = document.createElement('div');
    row.className = 'subject-row gpa-row manual-row';
    row.id = rowId;
    row.innerHTML = `
        <div>
            <label>Subject Code</label>
            <input type="text" class="subject-code" placeholder="e.g., CS3001" maxlength="15">
        </div>
        <div>
            <label>Credits</label>
            <input type="number" class="subject-credits" min="0.5" step="0.5" placeholder="e.g., 3">
        </div>
        <div>
            <label>Grade</label>
            <select class="subject-grade" required>
                ${getGradeSelectOptions()}
            </select>
        </div>
        <button class="btn btn-ghost manual-remove" onclick="removeManualSubject('${rowId}')" title="Remove subject" aria-label="Remove subject">
            ×
        </button>
        <div class="subject-index"></div>
    `;
    gpaSubjectsContainer.appendChild(row);
    refreshSubjectIndex();
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function renderGPASubjects() {
    const regulation = regulationFilter.value;
    const department = departmentFilter.value;
    const semester = semesterFilter.value;

    const subjects = creditData?.[regulation]?.[department]?.[semester];
    document.getElementById('gpa-result').classList.add('hidden');

    if (!subjects || Object.keys(subjects).length === 0) {
        gpaFilterNote.textContent = 'No subjects found for this selection.';
        renderEmptySubjects('No subjects available for the selected filters.');
        return;
    }

    gpaFilterNote.textContent = `Loaded ${Object.keys(subjects).length} subjects. Select grade for each subject.`;
    gpaSubjectsContainer.innerHTML = '';
    manualSubjectCount = 0;

    Object.entries(subjects).forEach(([subjectCode, details], index) => {
        const credits = Number(details.credits) || 0;
        const row = document.createElement('div');
        row.className = 'subject-row gpa-row';
        row.innerHTML = `
            <div>
                <label>Subject Code</label>
                <input type="text" class="subject-code" value="${subjectCode}" readonly>
            </div>
            <div>
                <label>Credits</label>
                <input type="number" class="subject-credits" value="${credits}" readonly>
            </div>
            <div>
                <label>Grade</label>
                <select class="subject-grade" required>
                    ${getGradeSelectOptions()}
                </select>
            </div>
            <div class="subject-index">#${index + 1}</div>
        `;
        gpaSubjectsContainer.appendChild(row);
    });
}

function syncDepartmentAndSemester() {
    const regulation = regulationFilter.value;
    const departments = Object.keys(creditData?.[regulation] || {}).sort((a, b) => a.localeCompare(b));

    if (!departments.length) {
        departmentFilter.innerHTML = '';
        semesterFilter.innerHTML = '';
        renderEmptySubjects('No departments available for the selected regulation.');
        return;
    }

    const currentDepartment = departments.includes(departmentFilter.value) ? departmentFilter.value : departments[0];
    createOptions(departmentFilter, departments, titleCaseDepartment);
    departmentFilter.value = currentDepartment;

    const semesters = Object.keys(creditData[regulation][currentDepartment] || {})
        .sort((a, b) => getNumericSemValue(a) - getNumericSemValue(b));

    if (!semesters.length) {
        semesterFilter.innerHTML = '';
        renderEmptySubjects('No semesters available for the selected department.');
        return;
    }

    const currentSemester = semesters.includes(semesterFilter.value) ? semesterFilter.value : semesters[0];
    createOptions(semesterFilter, semesters, sem => `Semester ${getNumericSemValue(sem)}`);
    semesterFilter.value = currentSemester;
    renderGPASubjects();
}

async function initializeGPAFilters() {
    try {
        const response = await fetch('../assets/data/credit.json');
        if (!response.ok) throw new Error('Unable to load credit data');

        const data = await response.json();
        creditData = data || {};

        const regulations = Object.keys(creditData).sort((a, b) => b.localeCompare(a));
        if (!regulations.length) {
            gpaFilterNote.textContent = 'No regulation data found.';
            renderEmptySubjects('Credit data is not available right now.');
            return;
        }

        createOptions(regulationFilter, regulations, regulation => regulation.replace(/([A-Za-z]+)(\d+)/, '$1 $2'));
        const defaultRegulation = regulations.includes('Regulation2021') ? 'Regulation2021' : regulations[0];
        regulationFilter.value = defaultRegulation;
        regulationFilter.addEventListener('change', syncDepartmentAndSemester);

        departmentFilter.addEventListener('change', () => {
            const regulation = regulationFilter.value;
            const semesters = Object.keys(creditData?.[regulation]?.[departmentFilter.value] || {})
                .sort((a, b) => getNumericSemValue(a) - getNumericSemValue(b));

            if (!semesters.length) {
                semesterFilter.innerHTML = '';
                renderEmptySubjects('No semesters available for the selected department.');
                return;
            }

            const currentSemester = semesters.includes(semesterFilter.value) ? semesterFilter.value : semesters[0];
            createOptions(semesterFilter, semesters, sem => `Semester ${getNumericSemValue(sem)}`);
            semesterFilter.value = currentSemester;
            renderGPASubjects();
        });

        semesterFilter.addEventListener('change', renderGPASubjects);
        syncDepartmentAndSemester();
    } catch (error) {
        gpaFilterNote.textContent = 'Could not load subject credits. Please try again.';
        renderEmptySubjects('Failed to load credit data.');
    }
}

function calculateGPA() {
    const rows = document.querySelectorAll('#gpa-subjects .subject-row');

    if (!rows.length) {
        gpaFilterNote.textContent = 'Please choose valid filters before calculating GPA.';
        return;
    }

    let totalPoints = 0;
    let totalCredits = 0;
    let firstInvalidRow = null;

    rows.forEach(row => {
        row.classList.remove('row-error');
        const credits = parseFloat(row.querySelector('.subject-credits').value) || 0;
        const grade = row.querySelector('.subject-grade').value;
        const hasInvalidCredit = credits <= 0;
        const hasMissingGrade = !grade;

        if (hasInvalidCredit || hasMissingGrade) {
            row.classList.add('row-error');
            if (!firstInvalidRow) firstInvalidRow = row;
            return;
        }

        const points = GRADE_POINTS[grade] || 0;
        totalPoints += credits * points;
        totalCredits += credits;
    });

    if (firstInvalidRow) {
        gpaFilterNote.textContent = 'Please enter credits and select grade for highlighted rows.';
        firstInvalidRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const focusTarget = firstInvalidRow.querySelector('.subject-grade') || firstInvalidRow.querySelector('.subject-credits');
        if (focusTarget) focusTarget.focus();
        return;
    }

    if (totalCredits === 0) {
        gpaFilterNote.textContent = 'Total credits cannot be zero for this semester.';
        return;
    }

    const gpa = (totalPoints / totalCredits).toFixed(2);
    const gpaNum = parseFloat(gpa);
    let gradeClass = '';

    if (gpaNum >= 9) gradeClass = 'Outstanding';
    else if (gpaNum >= 8) gradeClass = 'Excellent';
    else if (gpaNum >= 7) gradeClass = 'Very Good';
    else if (gpaNum >= 6) gradeClass = 'Good';
    else if (gpaNum >= 5) gradeClass = 'Average';
    else gradeClass = 'Reappear';

    document.getElementById('gpa-value').textContent = gpa;
    document.getElementById('gpa-grade').textContent = gradeClass;
    const gpaResult = document.getElementById('gpa-result');
    gpaResult.classList.remove('hidden');
    gpaResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetGPA() {
    const gradeSelects = document.querySelectorAll('#gpa-subjects .subject-grade');
    gradeSelects.forEach(select => {
        select.selectedIndex = 0;
    });

    const manualRows = document.querySelectorAll('#gpa-subjects .manual-row');
    manualRows.forEach(row => row.remove());

    document.getElementById('gpa-result').classList.add('hidden');
    gpaFilterNote.textContent = 'Grades reset. Select your grades to calculate GPA.';
    document.querySelectorAll('#gpa-subjects .subject-row').forEach(row => row.classList.remove('row-error'));
    refreshSubjectIndex();
}

function addCGPASemester() {
    cgpaSemesterCount++;
    const container = document.getElementById('cgpa-semesters');
    const row = document.createElement('div');
    row.className = 'subject-row';
    row.id = 'cgpa-semester-' + cgpaSemesterCount;
    row.innerHTML = `
        <div>
            <label>Semester ${cgpaSemesterCount} GPA</label>
            <input type="number" class="semester-gpa" min="0" max="10" step="0.01" placeholder="0.00">
        </div>
        <div>
            <label>Credits</label>
            <input type="number" class="semester-credits" min="1" placeholder="0">
        </div>
        <button class="btn btn-ghost" onclick="removeCGPASemester(${cgpaSemesterCount})" title="Remove">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18"><path d="M3 6h18"../../><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"../../></svg>
        </button>
    `;
    container.appendChild(row);
}

function removeCGPASemester(id) {
    const element = document.getElementById('cgpa-semester-' + id);
    if (element) element.remove();
}

function calculateCGPA() {
    const rows = document.querySelectorAll('#cgpa-semesters .subject-row');
    let totalPoints = 0;
    let totalCredits = 0;

    rows.forEach(row => {
        const gpa = parseFloat(row.querySelector('.semester-gpa').value) || 0;
        const credits = parseFloat(row.querySelector('.semester-credits').value) || 0;
        totalPoints += gpa * credits;
        totalCredits += credits;
    });

    if (totalCredits === 0) return;

    const cgpa = (totalPoints / totalCredits).toFixed(2);
    const cgpaNum = parseFloat(cgpa);
    let gradeClass = '';

    if (cgpaNum >= 7.5) gradeClass = 'First Class with Distinction';
    else if (cgpaNum >= 6.0) gradeClass = 'First Class';
    else if (cgpaNum >= 5.0) gradeClass = 'Second Class';
    else gradeClass = 'Third Class';

    document.getElementById('cgpa-value').textContent = cgpa;
    document.getElementById('cgpa-grade').textContent = gradeClass;
    const cgpaResult = document.getElementById('cgpa-result');
    cgpaResult.classList.remove('hidden');
    cgpaResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetCGPA() {
    document.getElementById('cgpa-semesters').innerHTML = '';
    cgpaSemesterCount = 0;
    addCGPASemester();
    document.getElementById('cgpa-result').classList.add('hidden');
}

function calculatePercentage() {
    const cgpa = parseFloat(document.getElementById('cgpa-input').value);
    if (isNaN(cgpa)) return;

    const percentage = (cgpa * 10).toFixed(2);
    const numPerc = parseFloat(percentage);
    let gradeClass = '';

    if (numPerc >= 75) gradeClass = 'First Class with Distinction';
    else if (numPerc >= 60) gradeClass = 'First Class';
    else if (numPerc >= 50) gradeClass = 'Second Class';
    else gradeClass = 'Third Class';

    document.getElementById('percentage-value').textContent = percentage + '%';
    document.getElementById('percentage-class').textContent = gradeClass;
    document.getElementById('percentage-result').classList.remove('hidden');
}

function resetPercentage() {
    document.getElementById('cgpa-input').value = '';
    document.getElementById('percentage-result').classList.add('hidden');
}

window.calculateGPA = calculateGPA;
window.resetGPA = resetGPA;
window.addManualSubject = addManualSubject;
window.removeManualSubject = removeManualSubject;
window.addCGPASemester = addCGPASemester;
window.removeCGPASemester = removeCGPASemester;
window.calculateCGPA = calculateCGPA;
window.resetCGPA = resetCGPA;
window.calculatePercentage = calculatePercentage;
window.resetPercentage = resetPercentage;

window.addEventListener('load', function() {
    initializeGPAFilters();
    addCGPASemester();
});