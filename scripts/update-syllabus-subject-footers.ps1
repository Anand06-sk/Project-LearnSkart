$root = "d:\Project-OpenNotes\syllabus"
$deptNotesMap = @{
    "civil" = "civil"
    "cse" = "cse"
    "ece" = "ece"
    "eee" = "eee"
    "it" = "it"
    "mech" = "mech"
}

$subjectFiles = Get-ChildItem -Path $root -Directory | Where-Object { $_.Name -in $deptNotesMap.Keys } | ForEach-Object {
    Get-ChildItem -Path $_.FullName -Directory | ForEach-Object {
        Join-Path $_.FullName "index.html"
    }
} | Where-Object { Test-Path $_ }

function Get-FooterTemplate([string]$notesDept, [string]$syllabusDept) {
@"
<footer>
    <div class="footer-content">
        <div class="footer-section">
            <h4 class="logo-brand"><img src="../../../assets/icons/favicon-96x96.png" alt="LearnSkart Logo" class="logo-img"> LearnSkart</h4>
            <p>Download Anna University syllabus PDF &ndash; All Departments & Semesters.</p>
        </div>
        <div class="footer-section">
            <h4>Quick Links</h4>
            <ul>
                <li><a href="../../../index.html">Home</a></li>
                <li><a href="../../../anna-university-notes/{0}/">Notes</a></li>
                <li><a href="../../../syllabus/2021/{1}/index.html">Syllabus</a></li>
                <li><a href="../../../previous-year-questions/">PYQs</a></li>
                <li><a href="../../../about/">About</a></li>
                <li><a href="../../../contact/">Contact</a></li>
            </ul>
        </div>
        <div class="footer-section">
            <h4>Legal</h4>
            <ul>
                <li><a href="../../../privacy/">Privacy Policy</a></li>
                <li><a href="../../../terms-and-conditions/">Terms and Conditions</a></li>
                <li><a href="../../../disclaimer/">Disclaimer</a></li>
            </ul>
        </div>
        <div class="footer-section footer-social">
            <h4>Follow Us</h4>
            <div class="social-links-row">
                <a class="social-link" href="https://www.instagram.com/learnskart?igsh=MWswMjdicWJ5dTQ3" target="_blank" rel="noopener noreferrer" aria-label="Follow LearnSkart on Instagram">
                    <i class="fab fa-instagram" aria-hidden="true"></i>
                    <span>@LearnSkart</span>
                </a>
                <a class="social-link" href="https://youtube.com/@learnskart?si=FnWsRKzRe_5hWqLr" target="_blank" rel="noopener noreferrer" aria-label="Visit LearnSkart on YouTube">
                    <i class="fab fa-youtube" aria-hidden="true"></i>
                    <span>YouTube</span>
                </a>
            </div>
        </div>
    </div>

<div class="footer-bottom">
        <p>&copy; 2026 LearnSkart. All rights reserved. Made with <i class="fas fa-heart"></i> for students.</p>
    </div>
</footer>
"@ -f $notesDept, $syllabusDept
}

foreach ($file in $subjectFiles) {
  $dept = Split-Path (Split-Path (Split-Path $file -Parent) -Parent) -Leaf
    $notesDept = $deptNotesMap[$dept]
    $syllabusDept = $dept
    $content = Get-Content -Raw -Path $file
    $content = [regex]::Replace($content, '(?s)<footer.*?</footer>', (Get-FooterTemplate $notesDept $syllabusDept))
    Set-Content -Path $file -Value $content
}
