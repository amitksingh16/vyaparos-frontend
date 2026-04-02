$baseUri = "http://localhost:5000/api"

# 1. Login & Get Token
Write-Host "Logging in..."
$loginBody = @{ phone = "9876543210" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUri/auth/login" -Method Post -ContentType "application/json" -Body $loginBody | Out-Null

$otpBody = @{ phone = "9876543210"; otp = "123456" } | ConvertTo-Json
$authResponse = Invoke-RestMethod -Uri "$baseUri/auth/verify-otp" -Method Post -ContentType "application/json" -Body $otpBody
$token = $authResponse.token
$headers = @{ Authorization = "Bearer $token" }
Write-Host "Got Token: $token"

# 2. Get Business
Write-Host "Fetching Businesses..."
$businesses = Invoke-RestMethod -Uri "$baseUri/businesses" -Method Get -Headers $headers

if ($businesses.Count -eq 0) {
    Write-Host "No businesses found. Creating one..."
    $newBusiness = @{
        business_name = "Test Enterprise";
        pan = "ABCDE1234F";
        business_type = "prop";
        state = "Maharashtra";
        turnover = 5000000;
        filing_type = "monthly"
    } | ConvertTo-Json
    $business = Invoke-RestMethod -Uri "$baseUri/businesses" -Method Post -Headers $headers -ContentType "application/json" -Body $newBusiness
    $businessId = $business.id
} else {
    $businessId = $businesses[0].id
}
Write-Host "Using Business ID: $businessId"

# 3. Generate Calendar
Write-Host "Generating Compliance Calendar..."
$genBody = @{ business_id = $businessId } | ConvertTo-Json
$genResponse = Invoke-RestMethod -Uri "$baseUri/compliance/generate" -Method Post -Headers $headers -ContentType "application/json" -Body $genBody
Write-Host "Generated $($genResponse.count) items."

# 4. Fetch Calendar
Write-Host "Fetching Calendar Items..."
$calendar = Invoke-RestMethod -Uri "$baseUri/compliance/calendar?business_id=$businessId" -Method Get -Headers $headers

$calendar | Format-Table compliance_type, due_date, status, notes
