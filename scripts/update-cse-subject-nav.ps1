$root = 'd:\Project-OpenNotes\anna-university-notes\cse'
$files = Get-ChildItem -Path $root -Filter index.html -Recurse | Where-Object {
    $_.FullName -match '\\anna-university-notes\\cse\\[^\\]+\\index\.html$'
}

$navHtml = @'
    <nav>
        <div class="nav-content">
            <a href="../../../" class="nav-logo">
                <img src="../../../assets/icons/favicon-96x96.png" alt="LearnSkart Logo" class="logo-img">
                <span>LearnSkart</span>
            </a>
            <div class="nav-right" id="navMenu">
                <div class="nav-links">
                    <a href="../../../">Home</a>
                    <a href="../">Department</a>
                    <a href="../../../syllabus/">Syllabus</a>
                    <a href="../../../previous-year-questions/">Previous Year Question Papers</a>
                    <a href="../../../anna-university-results/">Result Portal</a>
                    <a href="../../../contact/">Contact</a>
                </div>
                <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="navMobile" aria-label="Toggle navigation">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
        </div>
        <div class="nav-mobile" id="navMobile" aria-hidden="true">
            <div class="nav-mobile-inner">
                <div class="nav-group">
                    <div class="nav-group-title">Main</div>
                    <a href="../../../">Home</a>
                    <a href="../">Department</a>
                    <a href="../../../syllabus/">Syllabus</a>
                    <a href="../../../previous-year-questions/">Previous Year Question Papers</a>
                    <a href="../../../anna-university-results/">Result Portal</a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Support</div>
                    <a href="../../../about/">About</a>
                    <a href="../../../contact/">Contact</a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Legal</div>
                    <a href="../../../privacy/">Privacy Policy</a>
                    <a href="../../../disclaimer/">Disclaimer</a>
                    <a href="../../../terms-and-conditions/">Terms and Conditions</a>
                </div>
            </div>
        </div>
    </nav>
'@

foreach ($file in $files) {
    $content = Get-Content -LiteralPath $file.FullName -Raw
    $nl = [Environment]::NewLine

    if ($content -notmatch 'assets/css/nav\.css') {
        $content = $content -replace '(?i)</head>', ('    <link rel="stylesheet" href="../../../assets/css/nav.css">' + $nl + '</head>')
    }

    if ($content -notmatch 'assets/js/nav\.js') {
        $content = $content -replace '(?i)<body>', ('<body>' + $nl + '<script src="../../../assets/js/nav.js" defer></script>')
    }

    $content = [regex]::Replace($content, '(?s)<nav>\s*.*?class="nav-content".*?</nav>', '', 'Singleline')

    if ($content -match '(?i)<script[^>]*src="\.{2}/\.{2}/\.{2}/assets/js/nav\.js"[^>]*></script>') {
        $content = [regex]::Replace(
            $content,
            '(?i)(<script[^>]*src="\.{2}/\.{2}/\.{2}/assets/js/nav\.js"[^>]*></script>)',
            ('$1' + $nl + $navHtml),
            1
        )
    } else {
        $content = $content -replace '(?i)<body>', ('<body>' + $nl + $navHtml)
    }

    Set-Content -LiteralPath $file.FullName -Value $content
}
