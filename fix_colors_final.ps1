$files = @(
  'frontend\src\index.css',
  'frontend\src\components\Sidebar.tsx',
  'frontend\src\components\TopNavbar.tsx',
  'frontend\src\components\Navbar.tsx',
  'frontend\src\components\NotificationsCard.tsx',
  'frontend\src\components\AnalyticsCard.tsx',
  'frontend\src\components\ActivityTimeline.tsx',
  'frontend\src\components\StatCard.tsx',
  'frontend\src\components\QuickActions.tsx',
  'frontend\src\components\ItemCard.tsx',
  'frontend\src\components\MessagesPreview.tsx',
  'frontend\src\components\RecentReportsTable.tsx',
  'frontend\src\pages\SettingsPage.tsx',
  'frontend\src\pages\ProfilePage.tsx',
  'frontend\src\pages\ItemDetailPage.tsx',
  'frontend\src\pages\ReportItemPage.tsx',
  'frontend\src\pages\HomePage.tsx',
  'frontend\src\pages\ChatPage.tsx',
  'frontend\src\pages\AdminPage.tsx',
  'frontend\src\App.tsx'
)
foreach ($f in $files) {
  if (Test-Path $f) {
    $content = Get-Content $f -Raw
    $content = $content -replace 'rgba\(110, 159, 216,', 'rgba(0, 136, 255,'
    $content = $content -replace 'rgba\(110,159,216,', 'rgba(0,136,255,'
    $content = $content -replace 'rgba\(74, 122, 181,', 'rgba(0, 100, 200,'
    $content = $content -replace 'rgba\(74,122,181,', 'rgba(0,100,200,'
    $content = $content -replace '#6E9FD8', '#0088FF'
    $content = $content -replace '#4A7AB5', '#0066CC'
    $content = $content -replace '#5A8BC4', '#0077DD'
    $content = $content -replace '#3D6AA3', '#0055BB'
    Set-Content -Path $f -Value $content -NoNewline
    Write-Host "Updated: $f"
  }
}
Write-Host "Done!"
