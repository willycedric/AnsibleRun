const allTestPoints = [                                                
    {                                            
        "configName": "iPhone 6s Plus - 11.2.6", 
        "testCaseId": 97268                      
    },                                           
    {                                            
        "configName": "iPhone 6s Plus - 11.2.6", 
        "testCaseId": 96614                      
    },                                           
    {                                            
        "configName": "iPhone 6s Plus - 11.2.6", 
        "testCaseId": 96615                      
    },                                           
    {                                            
        "configName": "iPhone 6s Plus - 11.2.6", 
        "testCaseId": 96623                      
    },                                           
    {                                            
        "configName": "iPhone 6s Plus - 11.2.6", 
        "testCaseId": 96822                      
    },                                           
    {                                            
        "configName": "iPhone 6s Plus - 11.2.6", 
        "testCaseId": 97112                      
    },                                           
    {                                            
        "configName": "iPhone 6s Plus - 11.2.6", 
        "testCaseId": 97137                      
    },                                           
    {                                            
        "configName": "iPhone 6s Plus - 11.2.6", 
        "testCaseId": 97521                      
    }                                            
]                                                
 const failedAndActiveTestPoints = [
    {
        "configName": "iPhone 6s Plus - 11.2.6",
        "testCaseId": 97268
    },
    {
        "configName": "iPhone 6s Plus - 11.2.6",
        "testCaseId": 96614
    },
    {                                            
        "configName": "iPhone 6s Plus - 11.2.6", 
        "testCaseId": 97137                      
    }                                        
     
]

const failedTestPoints = [
    {
        "configName": "iPhone 6s Plus - 11.2.6",
        "testCaseId": 97268
    },
    {                                            
        "configName": "iPhone 6s Plus - 11.2.6", 
        "testCaseId": 97521                      
    } 
]

const abortedTestPoints = [
    {                                            
        "configName": "iPhone 6s Plus - 11.2.6", 
        "testCaseId": 97521                      
    } 
]

const parsedResults_1 = [
    'WI_97613_97268',
    'WI_97613_96614',
    'WI_97613_96615',
    'WI_97613_96623',
    'WI_97613_96822',
    'WI_97613_97112',
    'WI_97613_97137',
    'WI_97613_97521'
  ]

  const parsedResults_2 = [
    'WI_10000_97268',
    'WI_10000_96614',
    'WI_10000_96615',
    'WI_10000_96623',
    'WI_10000_96822',
    'WI_10000_97112',
    'WI_10000_97137',
    'WI_10000_97521'
  ]

  const TestPlanId_1 = 97613
  const TestPlanId_2 = 10000

const data = {
    allTestPoints,
    failedAndActiveTestPoints,
    failedTestPoints,
    abortedTestPoints,
    parsedResults_1,
    parsedResults_2,
    TestPlanId_1,
    TestPlanId_2

}

module.exports = data