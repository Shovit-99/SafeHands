$files = @(
  'frontend\src\pages\ProfilePage.tsx',
  'frontend\src\pages\ItemDetailPage.tsx',
  'frontend\src\pages\HomePage.tsx',
  'frontend\src\components\NotificationsCard.tsx',
  'frontend\src\components\AnalyticsCard.tsx',
  'frontend\src\components\ActivityTimeline.tsx'
)
foreach ($f in $files) {
  $content = Get-Content $f -Raw
  $content = $content -replace 'rgba\(124, 58, 237,', 'rgba(110, 159, 216,'
  $content = $content -replace 'rgba\(236, 72, 153,', 'rgba(74, 122, 181,'
  Set-Content -Path $f -Value $content -NoNewline
  Write-Host "Updated: $f"
}
Write-Host "Done!"
