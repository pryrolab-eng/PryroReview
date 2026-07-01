$projectRoot = "C:\Users\hp\Desktop\project"
$appDir = "$projectRoot\app"
$componentsDir = "$projectRoot\components"
$excludeFile = "$projectRoot\components\layout\footer.tsx"

$patterns = @(
    'text-slate-500',
    'text-slate-400',
    'text-slate-600',
    'text-slate-700',
    'text-slate-300',
    'text-zinc-500',
    'text-zinc-400',
    'text-zinc-600',
    'text-zinc-700',
    'text-zinc-300'
)

$files = @()
$files += Get-ChildItem -Path $appDir -Recurse -Filter "*.tsx"
$files += Get-ChildItem -Path $componentsDir -Recurse -Filter "*.tsx" | Where-Object {
    $_.FullName -ne $excludeFile
}

$totalReplacements = 0
$changedFiles = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $originalContent = $content
    $fileReplacements = 0

    foreach ($pattern in $patterns) {
        # Match pattern NOT preceded by "placeholder:"
        $escaped = [regex]::Escape($pattern)
        $regex = "(?<!placeholder:)$escaped"
        $matches = [regex]::Matches($content, $regex)
        $count = $matches.Count
        if ($count -gt 0) {
            $content = [regex]::Replace($content, $regex, 'text-zinc-900')
            $fileReplacements += $count
        }
    }

    if ($fileReplacements -gt 0) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        $relativePath = $file.FullName.Replace($projectRoot, '')
        Write-Output "[$fileReplacements replacements] $relativePath"
        $totalReplacements += $fileReplacements
        $changedFiles++
    }
}

Write-Output ""
Write-Output "=== SUMMARY ==="
Write-Output "Files scanned : $($files.Count)"
Write-Output "Files changed : $changedFiles"
Write-Output "Total replacements: $totalReplacements"
