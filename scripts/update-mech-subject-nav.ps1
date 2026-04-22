$root = "d:\Project-OpenNotes\syllabus\mech"
$nav = @'
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
        <a href="/syllabus/2021/mech/index.html">Syllabus</a>
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
        <a href="/syllabus/2021/mech/index.html">Syllabus</a>
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

Get-ChildItem -Path $root -Directory | ForEach-Object {
  $file = Join-Path $_.FullName "index.html"
  if (Test-Path $file) {
    $content = Get-Content -Raw $file
    $subject = [regex]::Match($content, '<title>.*?\|\s*(.*?)\s*\|\s*Anna University</title>', 'IgnoreCase').Groups[1].Value
    if ([string]::IsNullOrWhiteSpace($subject)) {
      $subject = 'Subject'
    }

    if ($content -notmatch '(?i)</head>') {
      $content = $content -replace '(?i)<body>', "</head>`r`n<body>"
    }

    $content = [regex]::Replace($content, '(?s)<nav\b.*?</nav>', $nav, 1)

    $breadcrumb = @"
  <div role="navigation" aria-label="Breadcrumb">
    <a href="../../../index.html">Home</a> &gt; <a href="../../../syllabus/">Syllabus</a> &gt; <a href="../../../anna-university-notes/mech/">Mechanical Engineering</a> &gt; <span>$subject</span>
  </div>
"@
    $content = [regex]::Replace(
      $content,
      '(?s)<nav\b.*?<main class="main container">',
      "${nav}`r`n`r`n<main class=`"main container`">`r`n$breadcrumb`r`n`r`n",
      1
    )

    $firstBreadcrumb = [regex]::Match($content, '(?s)<div role="navigation" aria-label="Breadcrumb">.*?</div>')
    if ($firstBreadcrumb.Success) {
      $before = $content.Substring(0, $firstBreadcrumb.Index) + $firstBreadcrumb.Value
      $after = $content.Substring($firstBreadcrumb.Index + $firstBreadcrumb.Length)
      $after = [regex]::Replace($after, '(?s)<div role="navigation" aria-label="Breadcrumb">.*?</div>', '')
      $content = $before + $after
    }

    $content = [regex]::Replace(
      $content,
      '(?s)(<div role="navigation" aria-label="Breadcrumb">.*?</div>)\s*.*?(<header class="content-header")',
      "`$1`r`n`r`n    `$2",
      1
    )

    $content = [regex]::Replace(
      $content,
      '(?s)\s*<a href="\.\./\.\./index\.html">Home</a>\s*&gt;\s*<a href="\.\./\.\./syllabus/">Syllabus</a>\s*&gt;\s*<a href="\.\./\.\./anna-university-notes/mech/">Mechanical Engineering</a>\s*&gt;\s*<span>.*?</span>\s*</div>',
      ""
    )


    if ($content -notmatch 'assets/css/nav\.css') {
      $content = $content -replace '(?i)(</head>)', "  <link rel=`"stylesheet`" href=`"../../../assets/css/nav.css`">`r`n$1"
    }

    if ($content -notmatch 'assets/js/nav\.js') {
      $content = $content -replace '(?i)</body>', "  <script src=`"../../../assets/js/nav.js`" defer></script>`r`n</body>"
    }

    Set-Content -Encoding UTF8 $file $content
  }
}
