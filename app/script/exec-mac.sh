# #!/bin/bash
# MONOPATH="/Library/Frameworks/Mono.framework/Versions/Current/Commands/mono"
# NUnit="/Users/voluntis/Workspace/run-testcases/packages/NUnit.ConsoleRunner.3.7.0/tools/nunit3-console.exe"
# echo "TestDLLPath = ${1}"
# echo "TESTCASECATEGORY = ${2}"
# echo "--------------------------------------------- start running test cases -----------------------------------------------"
# mono --debug ${NUnit} ${1} --where:${2} --noresult --labels:All --noheader
# echo  "--------------------------------------------- done -----------------------------------------------------------------"
#!/bin/bash
NUnit="/Users/voluntis/Workspace/run-testcases/packages/NUnit.ConsoleRunner.3.7.0/tools/nunit3-console.exe"
#Nunit="/Users/voluntis/Workspace/runner/NUnit.ConsoleRunner.3.10.0/tools/nunit3-console.exe"
echo "TestDLLPath = ${1}"
echo "testCasesFiltered = "${2}""
echo  "resultFile = ${3}"
echo "Index" =${4}
echo "Nunit path"=$Nunit
echo "--------------------------------------------- start running test cases -----------------------------------------------"
 mono  --debug ${NUnit} ${1} --where:"${2}"  --labels:All --noheader --result:"/Users/voluntis/Workspace/TestResults/${5}/${5}_iOS_${4}_Result_${3}.xml"
echo  "--------------------------------------------- done -----------------------------------------------------------------"
