$toneDataTypes = (Get-Content $PSScriptRoot\tone-datatypes.json | ConvertFrom-Json -AsHashtable).ToneDataTypes
$dataTypesTemplateHtml = "<span id=`"datatype-templates`">"
foreach ($dataTypeName in $toneDataTypes.Keys) {
  $dataTypeInfo = $toneDataTypes[$dataTypeName]

  $datatypeTemplateHtml = "<template id=`"$($dataTypeName)`">`r`n"
  $datatypeTemplateHtml += " <article>`r`n"
  $datatypeTemplateHtml += "  <label for=`"`${name}`">`${name}</label>`r`n"
  $datatypeTemplateHtml += "  <input name=`"`${name}`" type=`"range`" min=`"$($dataTypeInfo.min)`" max=`"$($dataTypeInfo.max)`" step=`"0.01`" value=`"`${value}`">`r`n"
  $datatypeTemplateHtml += " </article>`r`n"
  $datatypeTemplateHtml += "</template>`r`n" 

  $dataTypesTemplateHtml += $datatypeTemplateHtml
} 
$dataTypesTemplateHtml += "</span>"
$dataTypesTemplateHtml