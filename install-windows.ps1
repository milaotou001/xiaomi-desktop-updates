# 小咪教师包首次安装：同盘一次解压，校验后才进入固定目录。
# 公开入口应固定核对本文件 SHA256；以下覆盖参数供隔离测试使用。
param(
    [string]$ManifestUri = 'https://milaotou001.github.io/xiaomi-desktop-updates/install.json',
    [string]$ManifestPath = '',
    [string]$PackageZip = '',
    [string]$InstallParent = ''
)

$ErrorActionPreference = 'Stop'
if ([Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT -or
    [Environment]::OSVersion.Version.Major -lt 10 -or -not [Environment]::Is64BitOperatingSystem) {
    throw '目前仅支持 Windows 10/11 x64。'
}
if (-not $InstallParent) {
    $local = [Environment]::GetFolderPath('LocalApplicationData')
    if (-not $local) { throw '无法确定当前用户的本地程序目录。' }
    $InstallParent = Join-Path $local 'Programs'
}
$InstallParent = [System.IO.Path]::GetFullPath($InstallParent)
$target = Join-Path $InstallParent 'XiaomiDesktopPetTeacher'
if (Test-Path -LiteralPath $target) {
    throw "已有安装目录：$target。为保护现有安装和老师数据，本脚本不会覆盖它。"
}

Add-Type -AssemblyName System.Net.Http
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$handler = New-Object System.Net.Http.HttpClientHandler
$handler.AllowAutoRedirect = $false
$client = New-Object System.Net.Http.HttpClient($handler)
$client.Timeout = [TimeSpan]::FromMinutes(15)

function Get-HttpsResponse {
    param([string]$Address)
    $uri = New-Object System.Uri($Address)
    for ($i = 0; $i -lt 6; $i++) {
        if ($uri.Scheme -ne 'https') { throw "拒绝非 HTTPS 地址：$uri" }
        $response = $client.GetAsync($uri, [System.Net.Http.HttpCompletionOption]::ResponseHeadersRead).GetAwaiter().GetResult()
        if ([int]$response.StatusCode -in @(301, 302, 303, 307, 308)) {
            $location = $response.Headers.Location
            if (-not $location) { $response.Dispose(); throw '下载跳转缺少 Location。' }
            $uri = New-Object System.Uri($uri, $location)
            $response.Dispose()
            continue
        }
        $response.EnsureSuccessStatusCode() | Out-Null
        return $response
    }
    throw '下载跳转次数过多。'
}

function Get-Sha256 {
    param([string]$Path)
    $stream = [System.IO.File]::OpenRead($Path)
    $algorithm = [System.Security.Cryptography.SHA256]::Create()
    try {
        return ([System.BitConverter]::ToString($algorithm.ComputeHash($stream))).Replace('-', '').ToLowerInvariant()
    } finally {
        $stream.Dispose()
        $algorithm.Dispose()
    }
}

try {
    if ($ManifestPath) {
        $manifest = Get-Content -LiteralPath $ManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    } else {
        $response = Get-HttpsResponse $ManifestUri
        try { $manifest = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult() | ConvertFrom-Json }
        finally { $response.Dispose() }
    }
    $entry = $manifest.packages.'windows-x64'
    if ($manifest.schema_version -ne 1 -or $manifest.product -ne '小咪桌宠' -or
        -not $entry -or $entry.availability -ne 'ready' -or
        $entry.platform -ne 'windows' -or $entry.arch -ne 'x64' -or $entry.format -ne 'zip') {
        throw '安装清单格式错误，或 Windows x64 教师包尚未发布。'
    }
    if ([string]$entry.sha256 -notmatch '^[0-9a-fA-F]{64}$' -or [long]$entry.size -le 0) {
        throw '安装清单缺少有效的文件大小或 SHA256。'
    }
    $packageUri = New-Object System.Uri([string]$entry.url)
    if ($packageUri.Scheme -ne 'https') { throw '教师包地址不是 HTTPS。' }

    $downloaded = -not [bool]$PackageZip
    if ($downloaded) {
        $PackageZip = Join-Path ([System.IO.Path]::GetTempPath()) ('xiaomi-teacher-' + [guid]::NewGuid().ToString('N') + '.zip')
        $response = Get-HttpsResponse $packageUri.AbsoluteUri
        try {
            $inputStream = $response.Content.ReadAsStreamAsync().GetAwaiter().GetResult()
            $outputStream = [System.IO.File]::Create($PackageZip)
            try { $inputStream.CopyTo($outputStream) }
            finally { $outputStream.Dispose(); $inputStream.Dispose() }
        } finally { $response.Dispose() }
    }
    $item = Get-Item -LiteralPath $PackageZip
    if ($item.Length -ne [long]$entry.size) { throw '下载文件大小与清单不符，未解压。' }
    if ((Get-Sha256 $item.FullName) -ne ([string]$entry.sha256).ToLowerInvariant()) {
        throw '下载文件 SHA256 与清单不符，未解压。'
    }

    $archive = [System.IO.Compression.ZipFile]::OpenRead($item.FullName)
    try {
        $seen = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
        foreach ($zipEntry in $archive.Entries) {
            $name = $zipEntry.FullName.Replace('\', '/')
            if ($name.StartsWith('/') -or $name.Contains(':') -or
                @($name.Split('/') | Where-Object { $_ -eq '..' }).Count -gt 0 -or
                -not $seen.Add($name)) {
                throw "ZIP 含不安全或重复路径：$name"
            }
        }
        if (-not $seen.Contains('请让WorkBuddy读取这个文件夹.txt') -or
            -not $seen.Contains('runtime/Desktop Pet.exe') -or
            -not $seen.Contains('tools/setup.ps1')) {
            throw '教师包缺少必要文件，未解压。'
        }
    } finally { $archive.Dispose() }

    if (-not (Test-Path -LiteralPath $InstallParent)) {
        New-Item -ItemType Directory -Path $InstallParent -Force | Out-Null
    }
    $stage = Join-Path $InstallParent ('XiaomiDesktopPetTeacher.staging-' + [guid]::NewGuid().ToString('N'))
    [System.IO.Compression.ZipFile]::ExtractToDirectory($item.FullName, $stage)
    if (Test-Path -LiteralPath $target) { throw '安装期间出现了同名目录，已停止，未覆盖。' }
    Rename-Item -LiteralPath $stage -NewName 'XiaomiDesktopPetTeacher'
    if ($downloaded) { Remove-Item -LiteralPath $PackageZip -Force }
    [pscustomobject]@{ ok = $true; packageRoot = $target; deploymentVersion = $entry.deployment_version } |
        ConvertTo-Json -Compress
} finally {
    $client.Dispose()
    $handler.Dispose()
}
