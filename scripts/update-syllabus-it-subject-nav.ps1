$root = Join-Path $PSScriptRoot "..\syllabus\it"
$files = Get-ChildItem -Path $root -Recurse -Filter "index.html"
$newline = [Environment]::NewLine

$navMarkup = @'
  <nav>
    <div class="nav-content">
      <a href="/" class="nav-logo">
        <img src="../../../assets/icons/favicon-96x96.png" alt="LearnSkart Logo" class="logo-img">
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
          <a href="/syllabus/2021/it/index.html">Syllabus</a>
          <a href="/previous-year-questions/">Previous Year Question Papers</a>
          <a href="/">Notes</a>
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
          <a href="/anna-university-results/">Result Portal</a>
          <a href="/contact/">Contact</a>
        </div>
      </div>
    </div>
    <div class="nav-mobile" id="navMobile" aria-hidden="true">
      <div class="nav-mobile-inner">
        <div class="nav-group">
          <div class="nav-group-title">Main</div>
          <a href="/index.html">Home</a>
          <a href="/syllabus/2021/it/index.html">Syllabus</a>
          <a href="/previous-year-questions/">Previous Year Question Papers</a>
          <a href="/">Notes</a>
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
    $content = Get-Content -Path $file.FullName -Raw

    if ($content -notmatch 'assets/css/nav\.css') {
        $navCssInsert = '$1' + $newline + '  <link rel="stylesheet" href="../../../assets/css/nav.css">'
        $content = $content -replace '(?s)(<link rel="stylesheet" href="\.\./\.\./\.\./assets/css/syllabus-static\.css">)', $navCssInsert
    }

    if ($content -notmatch 'assets/js/nav\.js') {
        $navJsInsert = '  <script src="../../../assets/js/nav.js" defer></script>' + $newline + '</body>'
        $content = $content -replace '(?s)</body>', $navJsInsert
    }

    $content = $content -replace '(?s)<nav class="nav">.*?</nav>', $navMarkup
    $content = $content -replace '(?s)<nav aria-label="Breadcrumb">(.*?)</nav>', '<div role="navigation" aria-label="Breadcrumb">$1</div>'

    Set-Content -Path $file.FullName -Value $content -NoNewline
}
