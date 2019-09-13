const shell = require('node-powershell');
const argv = require('yargs').argv
const Promise = require('promise');
var scriptPath="\\\\FR-AUTO-002\\Repos\\Run-testCasesWeb\\script\\exec-win.ps1"
//const params="'\\\\FR-AUTO-002\\Insulia\\TEST_AUTO_STC_1.6.40\\RedwingAutomationWeb.dll'"  
var testParams= [];
/**
 * Run the test case specified in the category in a separate powershell process
 */
let result = "";
  const run =(category, index,path)=>{
    let ps = new shell({
      executionPolicy:"Bypass",
      noProfile: true,
      debugMsg:true
    })
    //Send the powershell process id to the master process
    console.log('PROCESS ID', ps._proc.pid)
    process.send(ps._proc.pid)
    testParams.push("TestDLLPath"+" "+path);
    // testParams.push("testCategory"+" "+"'"+argv._[0]+"'")
    // testParams.push("processIndex"+" "+"'"+argv._[1]+"'")
    testParams.push("testCategory"+" "+"'"+category+"'")
    testParams.push("processIndex"+" "+"'"+index+"'")
   // console.log("test parameters ", JSON.stringify(testParams, null, 4));
  // ps.addCommand(scriptPath, testParams)
  ps.addCommand('Write-Host node-powershell')
    ps.invoke()
    .then((output) => {
      
      process.send(output);
    })
    .catch(err => {
    console.log(err);
    ps.dispose();
    })
    .finally(()=>{
      ps.dispose();
    });
  }

  /**
   * Run the test cases specified in the category as a Promise which resolved with the Nunit console output
   * @param {*} category 
   * @param {*} index 
   */
  let runPromise = (category, index)=>{
    return new Promise((resolve, reject)=>{
      if(category == undefined || index == undefined)
      {
        reject(new Error("Missing test cases informations"));
      }
      else
      {
        let output = run(category, index);
        console.log(" ouput ==> ", output)
        resolve(output);
      }
    })
  }


  let  runTestCase =(category, index, testExecutablePath,type, project)=>{
  
    return new Promise((resolve, reject)=>{
      let ps = new shell({
        executionPolicy:"Bypass",
        noProfile: true,
        debugMsg:false
      })
      //console.log('PROCESS ID', ps._proc.pid)
      process.send(ps._proc.pid)
      // testParams.push("TestDLLPath"+" "+path+"\\RedwingAutomationWeb.dll");
      testParams.push("TestDLLPath"+" "+testExecutablePath);
      testParams.push("testCategory"+" "+"'"+category+"'")
      testParams.push("type"+" "+"'"+type+"'")
      testParams.push("processIndex"+" "+"'"+index+"'")
      testParams.push("project"+" "+"'"+project+"'")
      ps.addCommand(scriptPath, testParams)
      //ps.addCommand('Write-Host node-powershell')
        ps.invoke()
        .then((output) => { 
         resolve(output)
        })
        .catch(err => {
          reject(err)
        console.log(err)
        ps.dispose();
        })
        .finally(()=>{
          ps.dispose()
        })
    })
    
  }
/**
 * Run the test cases specified in the category as a Promise which resolved with the Nunit console output
 */
exports.runTestCase = runTestCase


