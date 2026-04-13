$root = "d:\Project-OpenNotes\gate-syllabus"
$subjectFiles = Get-ChildItem -Path $root -Directory | ForEach-Object { Join-Path $_.FullName "index.html" } | Where-Object { Test-Path $_ }

function Get-FooterTemplate([string]$prefix) {
@"
    <footer class="gate-footer">
        <div class="footer-wrap">
            <div class="footer-brand">
                <img src="${prefix}assets/icons/favicon-96x96.png" alt="LearnSkart">
                <p>LearnSkart is your hub for GATE syllabus and PYQs.</p>
            </div>
            <div class="footer-main">
                <div class="footer-section">
                    <h4 class="footer-title">Quick Links</h4>
                    <div class="quick-links">
                        <a href="${prefix}index.html">Home</a>
                        <a href="${prefix}gate-pyqs/">GATE PYQs</a>
                        <a href="${prefix}gate-syllabus/">GATE Syllabus</a>
                        <a href="${prefix}about/">About</a>
                        <a href="${prefix}contact/">Contact</a>
                    </div>
                </div>
                <div class="footer-section">
                    <h4 class="footer-title">Legal</h4>
                    <div class="quick-links">
                        <a href="${prefix}privacy/">Privacy Policy</a>
                        <a href="${prefix}terms-and-conditions/">Terms and Conditions</a>
                        <a href="${prefix}disclaimer/">Disclaimer</a>
                    </div>
                </div>
                <div class="footer-section footer-social">
                    <h4 class="footer-title">Follow Us</h4>
                    <div class="social-links">
                        <a href="https://www.instagram.com/learnskart?igsh=MWswMjdicWJ5dTQ3" target="_blank" rel="noopener noreferrer" aria-label="Follow LearnSkart on Instagram">
                            <i class="fab fa-instagram" aria-hidden="true"></i>
                        </a>
                        <a href="https://youtube.com/@learnskart?si=FnWsRKzRe_5hWqLr" target="_blank" rel="noopener noreferrer" aria-label="Visit LearnSkart on YouTube">
                            <i class="fab fa-youtube" aria-hidden="true"></i>
                        </a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">&copy; 2026 LearnSkart. All rights reserved. Made with <i class="fas fa-heart"></i></div>
        </div>
    </footer>
"@
}

foreach ($file in $subjectFiles) {
    $content = Get-Content -Raw -Path $file
    $content = [regex]::Replace($content, '(?s)<footer class="gate-footer">.*?</footer>', (Get-FooterTemplate "../../"))
    Set-Content -Path $file -Value $content
}
