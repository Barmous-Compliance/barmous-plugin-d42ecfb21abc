[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$version = "0.3.0"
$releaseDate = "2026-08-07"
$fixedZipTime = [DateTimeOffset]::new(2026, 8, 7, 0, 0, 0, [TimeSpan]::Zero)
$publicDownloads = Join-Path $repoRoot "public\downloads"
$pagesDownloads = Join-Path $repoRoot "docs\downloads"
$integrationSource = Join-Path $repoRoot "release\integrations"
$runtimeSource = Join-Path $repoRoot "plugins\barmous-company-data"
$previewNotice = Join-Path $repoRoot "public\PREVIEW_DISTRIBUTION_NOTICE.md"
$thirdPartyNotice = Join-Path $repoRoot "public\THIRD_PARTY_NOTICES.md"

$packages = @(
  [ordered]@{
    id = "codex"
    product = "Codex + ChatGPT"
    maker = "OpenAI"
    packageType = "Native plugin"
    installMethod = "Marketplace source"
    filename = "barmous-compliance-codex-plugin-v0.3.0.zip"
    existing = $true
  },
  [ordered]@{
    id = "claude"
    product = "Claude Code"
    maker = "Anthropic"
    packageType = "Native plugin"
    installMethod = "Marketplace source"
    filename = "barmous-compliance-claude-plugin-v0.3.0.zip"
    existing = $true
  },
  [ordered]@{
    id = "cursor"
    product = "Cursor"
    maker = "Anysphere"
    packageType = "Agent Plugin"
    installMethod = "Unzip into local plugins"
    filename = "barmous-compliance-cursor-plugin-v0.3.0.zip"
    source = "cursor"
    skills = $true
  },
  [ordered]@{
    id = "antigravity"
    product = "Antigravity"
    maker = "Google"
    packageType = "Native plugin"
    installMethod = "Unzip, then install folder"
    filename = "barmous-compliance-antigravity-plugin-v0.3.0.zip"
    source = "antigravity"
    skills = $true
  },
  [ordered]@{
    id = "perplexity"
    product = "Perplexity"
    maker = "Perplexity"
    packageType = "Connector kit"
    installMethod = "Configure endpoint or command"
    filename = "barmous-compliance-perplexity-connector-v0.3.0.zip"
    source = "perplexity"
    skills = $false
  },
  [ordered]@{
    id = "kimi"
    product = "Kimi Code"
    maker = "Moonshot AI"
    packageType = "Native plugin"
    installMethod = "Install extracted folder"
    filename = "barmous-compliance-kimi-code-plugin-v0.3.0.zip"
    source = "kimi-code"
    skills = $true
  },
  [ordered]@{
    id = "hermes"
    product = "Hermes"
    maker = "Nous Research"
    packageType = "Connector kit"
    installMethod = "Merge config"
    filename = "barmous-compliance-hermes-connector-v0.3.0.zip"
    source = "hermes"
    skills = $true
  }
)

function Copy-ReleaseItem {
  param(
    [Parameter(Mandatory)][string]$Source,
    [Parameter(Mandatory)][string]$Destination
  )

  if (-not (Test-Path -LiteralPath $Source)) {
    throw "Required release source is missing: $Source"
  }
  Copy-Item -LiteralPath $Source -Destination $Destination -Recurse -Force
}

function Normalize-TextFiles {
  param([Parameter(Mandatory)][string]$Root)

  $textExtensions = @(".json", ".md", ".mjs", ".js", ".txt", ".yaml", ".yml", ".ps1")
  $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
  Get-ChildItem -LiteralPath $Root -Recurse -File |
    Where-Object { $textExtensions -contains $_.Extension.ToLowerInvariant() } |
    ForEach-Object {
      $content = [IO.File]::ReadAllText($_.FullName)
      $content = [regex]::Replace($content, "\r\n?", [string][char]10)
      [IO.File]::WriteAllText($_.FullName, $content, $utf8NoBom)
    }
}

function Get-SafeRelativePath {
  param(
    [Parameter(Mandatory)][string]$BasePath,
    [Parameter(Mandatory)][string]$TargetPath
  )

  $baseFull = [IO.Path]::GetFullPath($BasePath).TrimEnd(
    [IO.Path]::DirectorySeparatorChar,
    [IO.Path]::AltDirectorySeparatorChar
  ) + [IO.Path]::DirectorySeparatorChar
  $targetFull = [IO.Path]::GetFullPath($TargetPath)
  if (-not $targetFull.StartsWith($baseFull, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to resolve a release path outside its base directory: $targetFull"
  }
  return $targetFull.Substring($baseFull.Length)
}

function Assert-SafeReleaseTree {
  param([Parameter(Mandatory)][string]$Root)

  $rootPath = [IO.Path]::GetFullPath($Root)
  $forbiddenPath = "(?i)(^|[\\/])(?:node_modules|\.git|\.env(?:\.|$)|credentials?(?:\.|$)|tokens?(?:\.|$))([\\/]|$)"
  $secretPattern = "(?i)(?:-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bsk-[A-Za-z0-9_-]{20,}\b|\bghp_[A-Za-z0-9]{20,}\b|\bgithub_pat_[A-Za-z0-9_]{20,}\b|\bAIza[A-Za-z0-9_-]{20,}\b)"

  Get-ChildItem -LiteralPath $Root -Recurse -Force | ForEach-Object {
    if (($_.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
      throw "Release tree contains a symlink or reparse point: $($_.FullName)"
    }
    $relative = Get-SafeRelativePath -BasePath $rootPath -TargetPath $_.FullName
    if ($relative -match $forbiddenPath) {
      throw "Release tree contains a forbidden path: $relative"
    }
    if (-not $_.PSIsContainer -and $_.Length -le 20MB) {
      $extension = $_.Extension.ToLowerInvariant()
      if (@(".json", ".md", ".mjs", ".js", ".txt", ".yaml", ".yml", ".ps1") -contains $extension) {
        $content = [IO.File]::ReadAllText($_.FullName)
        if ($content -match $secretPattern) {
          throw "Release tree contains a credential-like value: $relative"
        }
      }
    }
  }
}

function New-DeterministicZip {
  param(
    [Parameter(Mandatory)][string]$SourceDirectory,
    [Parameter(Mandatory)][string]$DestinationZip
  )

  Add-Type -AssemblyName System.IO.Compression
  $parent = Split-Path -Parent $SourceDirectory
  $files = Get-ChildItem -LiteralPath $SourceDirectory -Recurse -File |
    Sort-Object { (Get-SafeRelativePath -BasePath $parent -TargetPath $_.FullName).Replace("\", "/") }

  if ([IO.File]::Exists($DestinationZip)) {
    [IO.File]::Delete($DestinationZip)
  }

  $stream = [IO.File]::Open($DestinationZip, [IO.FileMode]::CreateNew)
  try {
    $archive = [IO.Compression.ZipArchive]::new(
      $stream,
      [IO.Compression.ZipArchiveMode]::Create,
      $false
    )
    try {
      foreach ($file in $files) {
        $entryName = (Get-SafeRelativePath -BasePath $parent -TargetPath $file.FullName).Replace("\", "/")
        $entry = $archive.CreateEntry($entryName, [IO.Compression.CompressionLevel]::Optimal)
        $entry.LastWriteTime = $fixedZipTime
        $entryStream = $entry.Open()
        try {
          $fileStream = [IO.File]::OpenRead($file.FullName)
          try {
            $fileStream.CopyTo($entryStream)
          } finally {
            $fileStream.Dispose()
          }
        } finally {
          $entryStream.Dispose()
        }
      }
    } finally {
      $archive.Dispose()
    }
  } finally {
    $stream.Dispose()
  }
}

function Get-PackageMetadata {
  param([Parameter(Mandatory)][System.Collections.IDictionary]$Package)

  $path = Join-Path $publicDownloads $Package.filename
  if (-not [IO.File]::Exists($path)) {
    throw "Expected package was not created: $path"
  }
  $file = Get-Item -LiteralPath $path
  $checksum = (Get-FileHash -Algorithm SHA256 -LiteralPath $path).Hash
  $sizeKb = [Math]::Round($file.Length / 1KB).ToString("N0", [Globalization.CultureInfo]::InvariantCulture) + " KB"

  return [ordered]@{
    id = $Package.id
    product = $Package.product
    maker = $Package.maker
    packageType = $Package.packageType
    installMethod = $Package.installMethod
    filename = $Package.filename
    bytes = $file.Length
    size = $sizeKb
    sha256 = $checksum
  }
}

New-Item -ItemType Directory -Path $publicDownloads -Force | Out-Null
New-Item -ItemType Directory -Path $pagesDownloads -Force | Out-Null

$tempBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$stagingRoot = Join-Path $tempBase ("barmous-integration-release-" + [guid]::NewGuid().ToString("N"))
$stagingFull = [IO.Path]::GetFullPath($stagingRoot)
if (-not $stagingFull.StartsWith($tempBase, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to use staging directory outside the system temp folder."
}
New-Item -ItemType Directory -Path $stagingRoot | Out-Null

try {
  foreach ($package in $packages | Where-Object { -not $_.existing }) {
    $rootName = [IO.Path]::GetFileNameWithoutExtension($package.filename)
    $packageRoot = Join-Path $stagingRoot $rootName
    New-Item -ItemType Directory -Path $packageRoot | Out-Null

    $sourceRoot = Join-Path $integrationSource $package.source
    Get-ChildItem -LiteralPath $sourceRoot -Force | ForEach-Object {
      Copy-ReleaseItem -Source $_.FullName -Destination $packageRoot
    }

    $runtimeRoot = Join-Path $packageRoot "runtime"
    New-Item -ItemType Directory -Path $runtimeRoot | Out-Null
    foreach ($runtimeEntry in @("package.json", "bin", "mcp")) {
      Copy-ReleaseItem -Source (Join-Path $runtimeSource $runtimeEntry) -Destination $runtimeRoot
    }
    $runtimePackagePath = Join-Path $runtimeRoot "package.json"
    $runtimePackage = Get-Content -LiteralPath $runtimePackagePath -Raw | ConvertFrom-Json
    $runtimePackage.description = "Local installer for the read-only Barmous CLI and MCP runtime"
    [IO.File]::WriteAllText(
      $runtimePackagePath,
      ($runtimePackage | ConvertTo-Json -Depth 6) + [string][char]10,
      [Text.UTF8Encoding]::new($false)
    )

    if ($package.skills) {
      Copy-ReleaseItem -Source (Join-Path $runtimeSource "skills") -Destination $packageRoot
    }
    Copy-ReleaseItem -Source (Join-Path $runtimeSource "assets") -Destination $packageRoot
    Copy-ReleaseItem -Source $previewNotice -Destination $packageRoot
    Copy-ReleaseItem -Source $thirdPartyNotice -Destination $packageRoot

    $packageManifest = [ordered]@{
      schemaVersion = 1
      product = $package.product
      packageType = $package.packageType
      version = $version
      released = $releaseDate
      readOnly = $true
      containsCredentials = $false
    }
    $manifestJson = $packageManifest | ConvertTo-Json -Depth 4
    [IO.File]::WriteAllText(
      (Join-Path $packageRoot "PACKAGE-MANIFEST.json"),
      $manifestJson + [string][char]10,
      [Text.UTF8Encoding]::new($false)
    )

    Normalize-TextFiles -Root $packageRoot
    Assert-SafeReleaseTree -Root $packageRoot
    New-DeterministicZip -SourceDirectory $packageRoot -DestinationZip (Join-Path $publicDownloads $package.filename)
  }

  $packageMetadata = @($packages | ForEach-Object { Get-PackageMetadata -Package $_ })

  $allFilename = "barmous-compliance-all-integrations-v0.3.0.zip"
  $allRootName = [IO.Path]::GetFileNameWithoutExtension($allFilename)
  $allRoot = Join-Path $stagingRoot $allRootName
  $allPackagesRoot = Join-Path $allRoot "packages"
  New-Item -ItemType Directory -Path $allPackagesRoot -Force | Out-Null
  Copy-ReleaseItem -Source (Join-Path $integrationSource "README.md") -Destination (Join-Path $allRoot "README.md")
  Copy-ReleaseItem -Source $previewNotice -Destination $allRoot
  Copy-ReleaseItem -Source $thirdPartyNotice -Destination $allRoot

  foreach ($metadata in $packageMetadata) {
    Copy-ReleaseItem -Source (Join-Path $publicDownloads $metadata.filename) -Destination $allPackagesRoot
  }

  $allManifest = [ordered]@{
    schemaVersion = 1
    version = $version
    released = $releaseDate
    packages = $packageMetadata
  }
  [IO.File]::WriteAllText(
    (Join-Path $allRoot "MANIFEST.json"),
    ($allManifest | ConvertTo-Json -Depth 6) + [string][char]10,
    [Text.UTF8Encoding]::new($false)
  )
  $checksumLines = $packageMetadata | ForEach-Object { "$($_.sha256)  packages/$($_.filename)" }
  [IO.File]::WriteAllLines(
    (Join-Path $allRoot "SHA256SUMS.txt"),
    $checksumLines,
    [Text.UTF8Encoding]::new($false)
  )

  Normalize-TextFiles -Root $allRoot
  Assert-SafeReleaseTree -Root $allRoot
  New-DeterministicZip -SourceDirectory $allRoot -DestinationZip (Join-Path $publicDownloads $allFilename)

  $allFile = Get-Item -LiteralPath (Join-Path $publicDownloads $allFilename)
  $allMetadata = [ordered]@{
    id = "all"
    product = "All integrations"
    maker = "Barmous Compliance"
    packageType = "Complete bundle"
    installMethod = "Choose your client package"
    filename = $allFilename
    bytes = $allFile.Length
    size = [Math]::Round($allFile.Length / 1KB).ToString("N0", [Globalization.CultureInfo]::InvariantCulture) + " KB"
    sha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $allFile.FullName).Hash
  }

  $generatedManifest = [ordered]@{
    version = $version
    released = $releaseDate
    packages = $packageMetadata
    all = $allMetadata
  }
  [IO.File]::WriteAllText(
    (Join-Path $repoRoot "release\integration-downloads.generated.json"),
    ($generatedManifest | ConvertTo-Json -Depth 6) + [string][char]10,
    [Text.UTF8Encoding]::new($false)
  )

  foreach ($metadata in @($packageMetadata) + @($allMetadata)) {
    $sourceArchive = Join-Path $publicDownloads $metadata.filename
    $pagesArchive = Join-Path $pagesDownloads $metadata.filename
    [IO.File]::WriteAllBytes($pagesArchive, [IO.File]::ReadAllBytes($sourceArchive))
  }

  $generatedManifest | ConvertTo-Json -Depth 6
} finally {
  if ([IO.Directory]::Exists($stagingFull)) {
    [IO.Directory]::Delete($stagingFull, $true)
  }
}
