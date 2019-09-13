 const { getAllTestPoints, parseTestPointsResult, parseArguments } = require('./../src/helper')
 const data = require('./data')
 const { RunTestCaseServiceUrl } = require('./../config')

 test.each`
 category                      | expected
 ${"all"}                      |  ${1}
${"failed and active"}         |  ${1}
 ${"failed"}                   |  ${1}
`('The mock should be called only $expected time when $category is passed as parameter', ({category, expected}) => {
   expect.assertions(1)
   expect.assertions(1)
        const mockFectch = jest.fn().mockReturnValue(Promise.resolve({
        json:()=> Promise.resolve(
              data.allTestPoints
            )
        }))
        return getAllTestPoints(mockFectch,97613,0,'all','GREENJAY','http://tfs')
        .then(data =>{
            expect(mockFectch.mock.calls.length).toBe(expected)
        })
});


test.each`
  category                      | expected
  ${"all"}                      |  ${RunTestCaseServiceUrl+"/GetAllTestPoints"}
 ${"failed and active"}         |  ${RunTestCaseServiceUrl+"/GetAllActiveAndFailedTestPoints"}
  ${"failed"}                   |  ${RunTestCaseServiceUrl+"/GetAllFailedTestPoints"}
`('returns $expected when $category is passed as parameter', ({category, expected}) => {
    expect.assertions(1)
    const mockFectch = jest.fn().mockReturnValue(Promise.resolve({
        json:()=> Promise.resolve(
            data.allTestPoints
            )
        }))
        return getAllTestPoints(mockFectch,97613,0,category,'GREENJAY','http://tfs')
            .then(data =>{
            expect(mockFectch.mock.calls[0][0]).toBe(expected)
            })
})


test.each`
   TestPlanId | parsedResults
   ${data.TestPlanId_2} | ${data.parsedResults_2} 
   ${data.TestPlanId_1} | ${data.parsedResults_1} 
`('return $parsedResults when the filtered test plan id is $TestPlanId',({TestPlanId, parsedResults})=>{
    expect.assertions(2)
    return parseTestPointsResult(data.allTestPoints, TestPlanId)
    .then((res) =>{        
        expect(res[0].length).toBe(parsedResults.length)
        expect(res[0]).toEqual(parsedResults)
    })
})

it.each`
 filter | error
 ${undefined} | ${"Please enter a test category filter"}
 ${""}|${"Please enter a test category filter"}

`(" return $error when the filte is $filter",({filter, error})=>{
    expect.assertions(1)
    const mockArgv = {
        filter: filter
    }
    return parseArguments(mockArgv)
    .catch((e)=>{
        expect(e).toEqual (error)
    })
})


it('Should resolved with a valid object when the filter is specify', ()=>{
    const mockArgv = {
        filter :[ "node", "port"],
        length:2,
        type: typeof({})
    }

    return parseArguments(mockArgv)
    .then(data =>{
        expect(data).toEqual({
            length:mockArgv.filter.length,
            data:mockArgv.filter,
            type:mockArgv.type
        })
    })
})

