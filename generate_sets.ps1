
$baseUrl = "http://localhost:3001/questions"

Write-Host "1. Generating Title-Chapter Sets (Admin)..."
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/generate-sets" -Method Post -Body (@{ titleId = "" } | ConvertTo-Json) -ContentType "application/json"
    Write-Host "Success: $($response | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
    # Read stream for details if available
    if ($_.Exception.Response.GetResponseStream) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Details: $($reader.ReadToEnd())"
    }
}

Write-Host "`n2. Generating Global Chapter Sets..."
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/chapter/sets" -Method Get
    Write-Host "Success: $($response | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
