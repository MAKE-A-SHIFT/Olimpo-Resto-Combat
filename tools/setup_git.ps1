$toolsDir = "C:\Users\firet\.tools"
if (!(Test-Path $toolsDir)) { New-Item -ItemType Directory -Path $toolsDir | Out-Null }

$gitDir = "$toolsDir\git"
if (!(Test-Path "$gitDir\cmd\git.exe")) {
    Write-Host "Downloading MinGit..."
    $minGitZip = "$toolsDir\mingit.zip"
    $minGitUrl = "https://github.com/git-for-windows/git/releases/download/v2.56.0.windows.4/MinGit-2.56.0.4-64-bit.zip"
    Invoke-WebRequest -Uri $minGitUrl -OutFile $minGitZip
    Write-Host "Extracting MinGit..."
    Expand-Archive -Path $minGitZip -DestinationPath $gitDir -Force
    Remove-Item $minGitZip -Force
}

$ghDir = "$toolsDir\gh"
if (!(Test-Path "$ghDir\bin\gh.exe")) {
    Write-Host "Downloading GitHub CLI..."
    $ghZip = "$toolsDir\gh.zip"
    $ghUrl = "https://github.com/cli/cli/releases/download/v2.103.2/gh_2.103.2_windows_amd64.zip"
    Invoke-WebRequest -Uri $ghUrl -OutFile $ghZip
    Write-Host "Extracting GitHub CLI..."
    $tempGh = "$toolsDir\temp_gh"
    Expand-Archive -Path $ghZip -DestinationPath $tempGh -Force
    $innerDir = Get-ChildItem -Path $tempGh -Directory | Select-Object -First 1
    if (!(Test-Path $ghDir)) { New-Item -ItemType Directory -Path $ghDir | Out-Null }
    Copy-Item -Path "$($innerDir.FullName)\*" -Destination $ghDir -Recurse -Force
    Remove-Item $tempGh -Recurse -Force
    Remove-Item $ghZip -Force
}

# Update User PATH
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
$pathsToAdd = @("$gitDir\cmd", "$gitDir\bin", "$ghDir\bin")
$modified = $false
foreach ($p in $pathsToAdd) {
    if ($userPath -notlike "*$p*") {
        $userPath = "$p;$userPath"
        $modified = $true
    }
}
if ($modified) {
    [Environment]::SetEnvironmentVariable("Path", $userPath, "User")
    Write-Host "User PATH updated permanently."
}

# Set current session PATH
$env:Path = "$gitDir\cmd;$gitDir\bin;$ghDir\bin;$env:Path"

Write-Host "Testing git:"
& "$gitDir\cmd\git.exe" --version

Write-Host "Testing gh:"
& "$ghDir\bin\gh.exe" --version
