$utf8NoBom = [System.Text.UTF8Encoding]::new($false)

$fixes = @(
    @{
        File = "d:\Project-OpenNotes\about\index.html"
        Replacements = @(
            @{ Old = "â€""; New = "—" }
        )
    },
    @{
        File = "d:\Project-OpenNotes\disclaimer\index.html"
        Replacements = @(
            @{ Old = "âš ï¸"; New = "⚠️" }
            @{ Old = "âœ""; New = "✓" }
        )
    },
    @{
        File = "d:\Project-OpenNotes\privacy\index.html"
        Replacements = @(
            @{ Old = "â€""; New = "—" }
            @{ Old = "ðŸ"'"; New = "🔒" }
        )
    },
    @{
        File = "d:\Project-OpenNotes\previous-year-questions\index.html"
        Replacements = @(
            @{ Old = "Â·"; New = "·" }
        )
    },
    @{
        File = "d:\Project-OpenNotes\pyq\EE3303-electrical-machines-i\index.html"
        Replacements = @(
            @{ Old = "â€""; New = "—" }
        )
    },
    @{
        File = "d:\Project-OpenNotes\pyq\EE3405-electrical-machines-ii\index.html"
        Replacements = @(
            @{ Old = "â€""; New = "—" }
        )
    }
)

foreach ($entry in $fixes) {
    $path = $entry.File
    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    $originalContent = $content

    foreach ($rep in $entry.Replacements) {
        $count = ($content | Select-String -Pattern ([regex]::Escape($rep.Old)) -AllMatches).Matches.Count
        $content = $content.Replace($rep.Old, $rep.New)
        Write-Host "  [$path] '$($rep.Old)' -> '$($rep.New)'  ($count replacements)"
    }

    if ($content -ne $originalContent) {
        [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
        Write-Host "  SAVED: $path"
    } else {
        Write-Host "  SKIPPED (no changes): $path"
    }
    Write-Host ""
}

Write-Host "Done."
