$ErrorActionPreference = "Stop"

$root = "d:\Project-OpenNotes"
$pyqRoot = Join-Path $root "pyq"
$syllabusRoot = Join-Path $root "syllabus"

$pyqFiles = Get-ChildItem -Path $pyqRoot -Recurse -Filter "index.html"
$syllabusFiles = Get-ChildItem -Path $syllabusRoot -Recurse -Filter "index.html"

$syllabusMap = @{}
foreach ($file in $syllabusFiles) {
    $folderName = (Split-Path $file.DirectoryName -Leaf).ToLower()
    if (-not $syllabusMap.ContainsKey($folderName)) {
        $syllabusMap[$folderName] = $file.FullName
    }
}

$missingSyllabus = New-Object System.Collections.Generic.List[string]

foreach ($file in $pyqFiles) {
    $html = Get-Content -LiteralPath $file.FullName -Raw
    $footerMatch = [regex]::Match($html, '(?s)<footer class="footer">.*?</footer>')
    if (-not $footerMatch.Success) {
        continue
    }

    $pyqFolder = (Split-Path $file.DirectoryName -Leaf).ToLower()
    if ($syllabusMap.ContainsKey($pyqFolder)) {
        $syllabusFull = $syllabusMap[$pyqFolder]
    } else {
        $syllabusFull = Join-Path $root "syllabus\index.html"
        $missingSyllabus.Add($file.FullName)
    }

    $syllabusRelative = "../../" + $syllabusFull.Substring($root.Length + 1).Replace('\\', '/')

    $descBlock = ""
    $descMatch = [regex]::Match($footerMatch.Value, '(?s)<div class="footer-logo".*?</div>\s*(<p[^>]*>.*?</p>)')
    if ($descMatch.Success) {
        $descBlock = $descMatch.Groups[1].Value
    }

    $newFooter = @"
<footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col">
                    <div class="footer-logo"><img src="../../assets/icons/favicon-96x96.png" alt="LearnSkart Logo" class="logo-img"> LearnSkart</div>
                    $descBlock
                </div>
                <div class="footer-col">
                    <h4>Quick Links</h4>
                    <ul class="footer-links">
                        <li><a href="../../index.html">Home</a></li>
                        <li><a href="../../previous-year-questions/index.html">Previous Year Questions</a></li>
                        <li><a href="$syllabusRelative">Syllabus</a></li>
                        <li><a href="../../about/index.html">About</a></li>
                        <li><a href="../../contact/index.html">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Legal</h4>
                    <ul class="footer-links">
                        <li><a href="../../privacy/index.html">Privacy Policy</a></li>
                        <li><a href="../../disclaimer/index.html">Disclaimer</a></li>
                        <li><a href="../../terms-and-conditions/index.html">Terms and conditions</a></li>
                    </ul>
                </div>
                <div class="footer-col footer-social">
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
            <div class="footer-bottom">&copy; 2026 LearnSkart. All rights reserved.</div>
        </div>
    </footer>
"@

    $newHtml = $html.Substring(0, $footerMatch.Index) + $newFooter + $html.Substring($footerMatch.Index + $footerMatch.Length)
    [System.IO.File]::WriteAllText($file.FullName, $newHtml)
}

if ($missingSyllabus.Count -gt 0) {
    $missingSyllabus | Set-Content -LiteralPath (Join-Path $root "scripts\pyq-missing-syllabus.txt")
}
