$root = "d:\Project-OpenNotes\pyq"
$files = Get-ChildItem -Path $root -Filter index.html -Recurse

$navBlock = @'
<nav>
        <div class="nav-content">
            <a href="/" class="nav-logo">
                <img src="../../assets/icons/favicon-96x96.png" alt="LearnSkart Logo" class="logo-img">
                <span>LearnSkart</span>
            </a>
            <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="navMobile" aria-label="Toggle navigation">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
            <div class="nav-right" id="navMenu">
                <div class="nav-links">
                    <a href="/index.html">Home</a>
                    <a href="/">Department</a>
                    <a href="/syllabus/">Syllabus</a>
                    <a href="/previous-year-questions/" class="is-active" aria-current="page">Previous Year Question Papers</a>
                    <a href="/anna-university-results/">Result Portal</a>
                    <div class="nav-dropdown">
                        <button class="dropdown-toggle" type="button" aria-expanded="false" aria-haspopup="true">
                            GATE
                            <i class="fas fa-chevron-down" aria-hidden="true"></i>
                        </button>
                        <div class="dropdown-menu" aria-label="GATE submenu">
                            <a href="/gate-syllabus/">GATE Syllabus</a>
                            <a href="/gate-pyqs/">GATE Previous Year Questions</a>
                        </div>
                    </div>
                    <a href="/contact/">Contact</a>
                </div>
            </div>
        </div>
        <div class="nav-mobile" id="navMobile" aria-hidden="true">
            <div class="nav-mobile-inner">
                <div class="nav-group">
                    <div class="nav-group-title">Main</div>
                    <a href="/index.html">Home</a>
                    <a href="/">Department</a>
                    <a href="/syllabus/">Syllabus</a>
                    <a href="/previous-year-questions/" class="is-active" aria-current="page">Previous Year Question Papers</a>
                    <a href="/anna-university-results/">Result Portal</a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">GATE</div>
                    <a href="/gate-syllabus/">GATE Syllabus</a>
                    <a href="/gate-pyqs/">GATE Previous Year Questions</a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Support</div>
                    <a href="/about/">About</a>
                    <a href="/contact/">Contact</a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Legal</div>
                    <a href="/privacy/">Privacy Policy</a>
                    <a href="/disclaimer/">Disclaimer</a>
                    <a href="/terms-and-conditions/">Terms and Conditions</a>
                </div>
            </div>
        </div>
    </nav>
'@

foreach ($file in $files) {
    $content = Get-Content -Raw -Path $file.FullName
    $original = $content

    if ($content -match '<nav class="nav">') {
        $content = [regex]::Replace($content, '(?s)<nav class="nav">.*?</nav>', $navBlock)
    }

    $content = [regex]::Replace(
        $content,
        '(?s)<nav aria-label="Breadcrumb"([^>]*)>(.*?)</nav>',
        '<div role="navigation" aria-label="Breadcrumb"$1>$2</div>'
    )

    if ($content -notmatch 'assets/css/nav\.css') {
        $content = [regex]::Replace(
            $content,
            '(?m)^(\s*<link rel="stylesheet" href="\.\./\.\./assets/css/pyq-static\.css">\s*)$',
            '$1    <link rel="stylesheet" href="../../assets/css/nav.css">'
        )
    }

    if ($content -notmatch 'assets/js/nav\.js') {
        $content = [regex]::Replace(
            $content,
            '(?m)^(\s*<script src="\.\./\.\./assets/js/theme\.js" defer></script>\s*)$',
            '    <script src="../../assets/js/nav.js" defer></script>' + "`r`n" + '$1'
        )
    }

    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content
    }
}
