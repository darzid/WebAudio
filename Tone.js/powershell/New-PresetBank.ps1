$presetBank = [ordered]@{} 

$presetRootPath = "$PSScriptRoot\presets"

$presetFiles = (Get-ChildItem $presetRootPath\*.json -Recurse).FullName.Substring($presetRootPath.Length + 1)

foreach ($presetFile in $presetFiles) {
  $presetContent = (Get-Content "$presetRootPath\$presetFile" -Raw) | ConvertFrom-Json -Depth 5
  $presetBank[$presetFile] = $presetContent
}

$presetBank | ConvertTo-Json -Depth 5 | Out-File "$PSScriptRoot\..\presets\preset-bank.json"