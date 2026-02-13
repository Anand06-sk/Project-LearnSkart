
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
        let gpaSubjectCount = 0;
        let cgpaSemesterCount = 0;

        // Set footer year
        document.getElementById('year').textContent = new Date().getFullYear();

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                
                this.classList.add('active');
                document.getElementById(tabName + '-panel').classList.add('active');
            });
        });

        // GPA Functions
        function addGPASubject() {
            gpaSubjectCount++;
            const container = document.getElementById('gpa-subjects');
            const row = document.createElement('div');
            row.className = 'subject-row';
            row.id = 'gpa-subject-' + gpaSubjectCount;
            row.innerHTML = `
                <div>
                    <label>Subject Name</label>
                    <input type="text" class="subject-name" placeholder="Subject ${gpaSubjectCount}" value="Subject ${gpaSubjectCount}">
                </div>
                <div>
                    <label>Credits</label>
                    <input type="number" class="subject-credits" min="1" max="5" value="3">
                </div>
                <div>
                    <label>Grade</label>
                    <select class="subject-grade">
                        <option value="O">O</option>
                        <option value="A+" selected>A+</option>
                        <option value="A">A</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="U">U</option>
                    </select>
                </div>
                <button class="btn btn-ghost" onclick="removeGPASubject(${gpaSubjectCount})" title="Remove">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            `;
            container.appendChild(row);
        }

        function removeGPASubject(id) {
            const element = document.getElementById('gpa-subject-' + id);
            if (element) element.remove();
        }

        function calculateGPA() {
            const rows = document.querySelectorAll('#gpa-subjects .subject-row');
            let totalPoints = 0;
            let totalCredits = 0;

            rows.forEach(row => {
                const credits = parseFloat(row.querySelector('.subject-credits').value) || 0;
                const grade = row.querySelector('.subject-grade').value;
                const points = GRADE_POINTS[grade] || 0;
                totalPoints += credits * points;
                totalCredits += credits;
            });

            if (totalCredits === 0) return;

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
            document.getElementById('gpa-result').classList.remove('hidden');
        }

        function resetGPA() {
            document.getElementById('gpa-subjects').innerHTML = '';
            gpaSubjectCount = 0;
            addGPASubject();
            document.getElementById('gpa-result').classList.add('hidden');
        }

        // CGPA Functions
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
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
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
            document.getElementById('cgpa-result').classList.remove('hidden');
        }

        function resetCGPA() {
            document.getElementById('cgpa-semesters').innerHTML = '';
            cgpaSemesterCount = 0;
            addCGPASemester();
            document.getElementById('cgpa-result').classList.add('hidden');
        }

        // Percentage Functions
        function calculatePercentage() {
            const cgpa = parseFloat(document.getElementById('cgpa-input').value);
            if (isNaN(cgpa)) return;

            const percentage = ((cgpa - 0.75) * 10).toFixed(2);
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

        // Initialize with default subject
        window.addEventListener('load', function() {
            addGPASubject();
        });