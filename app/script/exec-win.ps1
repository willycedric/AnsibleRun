 param(
 
    [Parameter(Mandatory=$true, Position=1)]
    [string]$TestDLLPath,
    [Parameter(Mandatory=$true, Position=2)]
    [string]$testCategory,
    [Parameter(Mandatory=$true, Position=3)]
    [string]$type,
    [Parameter(Mandatory=$true, Position=4)]
    [string]$processIndex ,
    [Parameter(Mandatory=$true, Position=5)]
    [string]$project
)
#[Parameter(Mandatory=$true, Position=3)]
#[string]$Label,
#[Parameter(Mandatory=$true, Position=4)]
#[string]$noheader,
#[Parameter(Mandatory=$true, Position=5)]
#[string]$noresult,
#[Parameter(Mandatory=$true, Position=6)]
#[string]$dispose
$limiter ="------------------------------------------------------------------------------------------------------------------------------------------------------------------------------"
#Get the current working directory
$currentDir = (Get-Item -Path ".\" -Verbose).FullName
Write-Host $currentDir

#Nunit directory
#$NunitDir=$currentDir+"\packages\NUnit.ConsoleRunner.3.7.0\tools\nunit3-console.exe"
$NunitDir="C:\Users\willy.dongmo\Documents\Nunit\NUnit.ConsoleRunner.3.10.0\tools\nunit3-console.exe"


#Nunit category filter
# if($environnment -eq '')
# {
#     $CategoryFilter = "--where:cat=={0}" -f "$testCategory"
# }
# else{
#     $CategoryFilter = "--where:cat=={0}&&cat=={1}" -f "$testCategory","$environnment"
# }

$CategoryFilter = '--where:{0}' -f """$testCategory"""  
#$CategoryFilter = '--where:"cat=WI_103243_102832" or "cat=WI_103243_102831"'
# $outputFile = "--result:C:\Program Files (x86)\Jenkins\workspace\Android_Basic_Sanety_Check\TestResult_{0}.xml;format=nunit2" -f "$processIndex"
#$outputFile = "--result:\\FR-AUTO-002\{2}\TestResults\Web\{0}\{2}_Web_{0}_Result_{1}.xml;format=nunit2" -f "$type","$processIndex","$project"
$outputFile = "--result:\\FR-AUTO-002\{2}\TestResults\Web\{0}\{2}_Web_{0}_Result_{1}.xml" -f "$type","$processIndex","$project"

Write-Host $limiter
Write-Host "Test category filter argument $CategoryFilter"
Write-Host "Starting Nunit Test"
Write-Host $limiter
Write-Host $NunitDir  $TestDLLPath $CategoryFilter   '--labels:All' '--noheader' '--inprocess'  $outputFile

&$NunitDir  $TestDLLPath $CategoryFilter   "--labels:All" "--noheader" "--inprocess" "$outputFile"

Write-Host $limiter

$outputMessage = "Test completed for the process:{0}" -f $processIndex
Write-Host $outputMessage

Write-Host $limiter

