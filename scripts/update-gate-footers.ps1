$ErrorActionPreference = "Stop"

$root = "d:\Project-OpenNotes"
$gateRoot = Join-Path $root "gate"

$gateFiles = Get-ChildItem -Path $gateRoot -Recurse -Filter "index.html"

foreach ($file in $gateFiles) {
    $html = Get-Content -LiteralPath $file.FullName -Raw
    $footerMatch = [regex]::Match($html, '(?s)<footer class="footer">.*?</footer>')
    if (-not $footerMatch.Success) {
        continue
    }

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
                    <li><a href="../../gate-pyqs/index.html">GATE Previous Year Questions</a></li>
                    <li><a href="../../gate-syllabus/index.html">GATE Syllabus</a></li>
                    <li><a href="../../about/index.html">About</a></li>
                    <li><a href="../../contact/index.html">Contact</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Legal</h4>
                <ul class="footer-links">
                    <li><a href="../../privacy/index.html">Privacy Policy</a></li>
                    <li><a href="../../disclaimer/index.html">Disclaimer</a></li>
                    <li><a href="../../terms-and-conditions/index.html">Terms and Conditions</a></li>
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
