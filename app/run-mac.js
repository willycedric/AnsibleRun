const argv = require('yargs').argv
const Promise = require('promise');
const { spawn }= require('child_process');

let  runTestCaseMac =(category, index,path, type, projectName)=>{
  return new Promise((resolve, reject)=>{

   const child = spawn('sh', ['script/exec-mac.sh', path, category, type, index,projectName],{stdio:'inherit'})
   child.on('exit', (code, signal)=>{
      if(code !=0){
        reject(`an error occured with exit code${code} `)
      }else{
         console.log('regular out ', code)
         resolve("app Exited ", code)
      }
   })
  
  })
  
}
   
exports.runTestCaseMac = runTestCaseMac

