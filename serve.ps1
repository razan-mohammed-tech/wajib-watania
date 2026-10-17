<#
  واجب مواطنة — خادم محلي بسيط (لا يحتاج صلاحيات مدير)
  الاستخدام:  powershell -ExecutionPolicy Bypass -File .\serve.ps1 -Port 8080
  ثم افتح المتصفح على:  http://localhost:8080
#>
param(
    [int]$Port = 8080,
    [string]$Root = $PSScriptRoot
)

$ErrorActionPreference = 'Stop'

$mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'text/javascript; charset=utf-8'
    '.mjs'  = 'text/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.svg'  = 'image/svg+xml'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.webp' = 'image/webp'
    '.ico'  = 'image/x-icon'
    '.woff2'= 'font/woff2'
    '.txt'  = 'text/plain; charset=utf-8'
}

$rootFull = [System.IO.Path]::GetFullPath($Root)
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()
Write-Host "تم تشغيل الخادم:  http://localhost:$Port   (اضغط Ctrl+C للإيقاف)"

function Send-Response([System.Net.Sockets.NetworkStream]$stream, [int]$status, [string]$contentType, [byte[]]$body) {
    $reason = switch ($status) { 200 {'OK'} 404 {'Not Found'} 500 {'Internal Server Error'} default {'OK'} }
    $head = "HTTP/1.1 $status $reason`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nCache-Control: no-store, must-revalidate`r`nConnection: close`r`n`r`n"
    $headBytes = [System.Text.Encoding]::ASCII.GetBytes($head)
    $stream.Write($headBytes, 0, $headBytes.Length)
    $stream.Write($body, 0, $body.Length)
}

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
            $requestLine = $reader.ReadLine()
            if (-not $requestLine) { continue }

            # قراءة ترويسات الطلبات (مع محاولة قراءة محتوى إن وُجد)
            $contentLength = 0
            while ($true) {
                $line = $reader.ReadLine()
                if ([string]::IsNullOrEmpty($line)) { break }
                if ($line -match '^Content-Length:\s*(\d+)$') { $contentLength = [int]$Matches[1] }
            }
            if ($contentLength -gt 0) {
                $buffer = New-Object byte[] $contentLength
                $total = 0
                while ($total -lt $contentLength) {
                    $read = $stream.Read($buffer, $total, $contentLength - $total)
                    if ($read -le 0) { break }
                    $total += $read
                }
            }

            $parts = $requestLine -split ' '
            $rawPath = if ($parts.Length -ge 2) { $parts[1] } else { '/' }
            # إزالة سلسلة الاستعلام (?x=y) والمرساة (#z) قبل تحديد الملف
            $path = [System.Uri]::UnescapeDataString($rawPath)
            $qIndex = $path.IndexOfAny([char[]]@('?', '#'))
            if ($qIndex -ge 0) { $path = $path.Substring(0, $qIndex) }
            $path = $path.TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($path)) { $path = 'index.html' }

            $fullPath = $null
            try {
                $fullPath = [System.IO.Path]::GetFullPath((Join-Path $rootFull $path))
            }
            catch {
                $fullPath = $null
            }

            if ($null -eq $fullPath -or -not $fullPath.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
                Send-Response $stream 404 'text/plain; charset=utf-8' ([System.Text.Encoding]::UTF8.GetBytes('404'))
            }
            elseif (Test-Path $fullPath -PathType Container) {
                $fullPath = Join-Path $fullPath 'index.html'
            }

            if (Test-Path $fullPath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($fullPath)
                $ext = [System.IO.Path]::GetExtension($fullPath).ToLowerInvariant()
                $type = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
                Send-Response $stream 200 $type $bytes
            }
            else {
                Send-Response $stream 404 'text/plain; charset=utf-8' ([System.Text.Encoding]::UTF8.GetBytes('404 - الملف غير موجود'))
            }
        }
        catch {
            try {
                $err = [System.Text.Encoding]::UTF8.GetBytes('500')
                Send-Response $client.GetStream() 500 'text/plain; charset=utf-8' $err
            } catch {}
        }
        finally { $client.Close() }
    }
}
finally {
    $listener.Stop()
}
