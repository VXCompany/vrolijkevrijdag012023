$Uri = "http://localhost/predict/image"
$File = "C:\Users\<user>\Downloads\vader.jpg"
$Form = @{
    file= Get-Item -Path $File
}

$Result = Invoke-WebRequest -Uri $Uri -Method Post -Form $Form -SkipHttpErrorCheck

$httpStatus = $Result.StatusCode

if ($httpStatus -eq 200)
{
    $j = $Result.Content | ConvertFrom-Json
    Write-Host $j.class
    Write-Host $j.confidence
}