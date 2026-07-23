Get-ChildItem $PSScriptRoot\WebSynth3.ts\*.html -Recurse | ForEach-Object { Copy-Item $_ -Destination $_.FullName.Replace('\WebSynth3.ts\', '\Dist\WebSynth3.ts\')}
Get-ChildItem $PSScriptRoot\WebSynth3.ts\*.css -Recurse | ForEach-Object { Copy-Item $_ -Destination $_.FullName.Replace('\WebSynth3.ts\', '\Dist\WebSynth3.ts\')}
New-Item $PSScriptRoot\dist\WebSynth3.ts\img -ItemType Directory -Force
Get-ChildItem $PSScriptRoot\WebSynth3.ts\*.png -Recurse | ForEach-Object { Copy-Item $_ -Destination $_.FullName.Replace('\WebSynth3.ts\', '\Dist\WebSynth3.ts\')}
