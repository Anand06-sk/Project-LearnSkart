$root = Join-Path $PSScriptRoot "..\pyq"
$files = Get-ChildItem -Path $root -Recurse -Filter "index.html"
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $updated = $content -replace '<a href="/">Department</a>', '<a href="/">Notes</a>'
    if ($updated -ne $content) {
        Set-Content -Path $file.FullName -Value $updated -NoNewline
    }
}
