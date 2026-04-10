$root = "d:\Project-OpenNotes"
$youtubeAnchor = '<a href="https://youtube.com/@learnskart?si=FnWsRKzRe_5hWqLr" title="YouTube" target="_blank" rel="noopener noreferrer"><i class="fab fa-youtube" style="color: #ff0000;"></i></a>'
$instagramAnchorPattern = '<a\s+[^>]*href="https://www\.instagram\.com/learnskart\?igsh=MWswMjdicWJ5dTQ3"[^>]*>.*?<i class="fab fa-instagram"[^>]*></i>.*?</a>'

function Get-FileTextWithEncoding {
    param([string]$path)
    $bytes = [System.IO.File]::ReadAllBytes($path)
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        $encoding = New-Object System.Text.UTF8Encoding($true)
        $text = $encoding.GetString($bytes, 3, $bytes.Length - 3)
        return @{ Text = $text; Encoding = $encoding }
    }
    if ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
        $encoding = New-Object System.Text.UnicodeEncoding($false, $true)
        $text = $encoding.GetString($bytes, 2, $bytes.Length - 2)
        return @{ Text = $text; Encoding = $encoding }
    }
    if ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFE -and $bytes[1] -eq 0xFF) {
        $encoding = New-Object System.Text.UnicodeEncoding($true, $true)
        $text = $encoding.GetString($bytes, 2, $bytes.Length - 2)
        return @{ Text = $text; Encoding = $encoding }
    }
    $encoding = New-Object System.Text.UTF8Encoding($false)
    $text = $encoding.GetString($bytes)
    return @{ Text = $text; Encoding = $encoding }
}

Get-ChildItem -Path $root -Recurse -Filter index.html | ForEach-Object {
    $info = Get-FileTextWithEncoding -path $_.FullName
    $content = $info.Text

    if ($content -notmatch 'instagram.com/learnskart') {
        return
    }

    if ($content -match 'youtube.com/@learnskart') {
        return
    }

    $updated = [regex]::Replace(
        $content,
        '<i class="fab fa-instagram"\s*>',
        '<i class="fab fa-instagram" style="color: #e1306c;">'
    )

    $updated = [regex]::Replace(
        $updated,
        $instagramAnchorPattern,
        { param($m) $m.Value + "`n" + $youtubeAnchor },
        [System.Text.RegularExpressions.RegexOptions]::Singleline
    )

    if ($updated -ne $content) {
        [System.IO.File]::WriteAllText($_.FullName, $updated, $info.Encoding)
    }
}
