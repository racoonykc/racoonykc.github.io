param(
  [string]$SourceRoot = 'C:/Users/kaich/Desktop/by_image'
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$destination = Join-Path $PSScriptRoot '../assets/img/justquant/flux-archive'
$files = @('00_fp.png', '01_convrot.png', '02_svdquant.png', '03_ours_10500.png')
$groups = @(Get-ChildItem -LiteralPath $SourceRoot -Directory | Where-Object {
  $dir = $_.FullName
  @($files | Where-Object { Test-Path -LiteralPath (Join-Path $dir $_) }).Count -eq 4
} | Sort-Object Name)
$contact = New-Object System.Drawing.Bitmap(1080, ([int][Math]::Ceiling($groups.Count / 6.0) * 210))
$graphics = [System.Drawing.Graphics]::FromImage($contact)
$graphics.Clear([System.Drawing.Color]::White)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$font = New-Object System.Drawing.Font('Arial', 10)
$copied = 0
try {
  for ($i = 0; $i -lt $groups.Count; $i++) {
    $group = $groups[$i]
    $target = Join-Path $destination $group.Name
    New-Item -ItemType Directory -Path $target -Force | Out-Null
    foreach ($file in $files) {
      $original = Join-Path $group.FullName $file
      $copy = Join-Path $target $file
      if (!(Test-Path -LiteralPath $copy) -or (Get-FileHash -LiteralPath $original).Hash -ne (Get-FileHash -LiteralPath $copy).Hash) {
        Copy-Item -LiteralPath $original -Destination $copy
      }
      if ((Get-FileHash -LiteralPath $original).Hash -ne (Get-FileHash -LiteralPath $copy).Hash) { throw "Copy verification failed: $copy" }
      $copied++
    }
    $image = [System.Drawing.Image]::FromFile((Join-Path $group.FullName '03_ours_10500.png'))
    $thumb = New-Object System.Drawing.Bitmap(160, 160)
    $thumbGraphics = [System.Drawing.Graphics]::FromImage($thumb)
    try {
      $thumbGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $thumbGraphics.DrawImage($image, 0, 0, 160, 160)
      $thumb.Save((Join-Path $target 'thumbnail.jpg'), [System.Drawing.Imaging.ImageFormat]::Jpeg)
      $x = ($i % 6) * 180 + 10
      $y = [int][Math]::Floor($i / 6) * 210 + 10
      $graphics.DrawImage($image, $x, $y, 160, 160)
      $graphics.DrawString(('{0:D2} {1}' -f ($i+1), $group.Name.Substring(0,[Math]::Min(10,$group.Name.Length))), $font, [System.Drawing.Brushes]::Black, $x, ($y+169))
    } finally { $thumbGraphics.Dispose(); $thumb.Dispose(); $image.Dispose() }
  }
  $preview = Join-Path $env:TEMP 'justquant-review'
  New-Item -ItemType Directory -Path $preview -Force | Out-Null
  $contact.Save((Join-Path $preview 'archive-contact.jpg'), [System.Drawing.Imaging.ImageFormat]::Jpeg)
  [PSCustomObject]@{Scenes=$groups.Count; OriginalImages=$copied; Resolution='1024 x 1024'; ContactSheet=(Join-Path $preview 'archive-contact.jpg')} | ConvertTo-Json
} finally { $font.Dispose(); $graphics.Dispose(); $contact.Dispose() }
