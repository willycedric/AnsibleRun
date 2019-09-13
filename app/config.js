let Config = {}

Config.RunTestCaseServiceUrl = "http://web-tools-dev/RunTestCaseService/api/RunTestCase"
Config.SERVER_PORT = 8082
Config.DefaultTimeout="10800s"
Config.defaultUser="VOLUNTIS\\VOL_USR_BUILT"
Config.dummyId=""
Config.TfsProjectName="REDWING"
Config.TfsUrl ="http://tfs004dvlvw:8080/DefaultCollection3"
Config.MAX_TEST_BY_STACK=10
Config.FILTER_SEPARATOR =" or cat="

 // Container for all the environments
 const environments = {}

 // Staging (default) environment
 
 environments.staging = {
     'httpPort':3000,
     'envName':'staging'
    
 }
 
 // Production environment
 environments.production = {
     'httpPort':5000,
     'envName': 'production'
 }
 
 //Determine wich environment was passed as a command-line argument
 const currentEnvironment = typeof(process.env.NODE_ENV) == 'string'?process.env.NODE_ENV.toLowerCase():''
 
 //Check that the current environment is one of the environments above, if not, defaut to staging
 Config.environmentToExport = typeof(environments[currentEnvironment]) == 'object'? environments[currentEnvironment]:environments.staging
module.exports= Config