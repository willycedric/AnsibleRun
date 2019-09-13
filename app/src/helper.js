var Promise = require('promise');
const argv = require('yargs').argv;
let Config = require("./../config")
const { fork } = require('child_process')
const isWin = process.platform === "win32"
const { runTestCase } = require('./../run-win')
const { runTestCaseMac } = require('./../run-mac')
const _ = require('lodash')
const { MAX_TEST_BY_STACK } = require('./../config')
const util = require('util')
const debug = util.debuglog('workers')
const url = require('url')
const version = require('root-require')('package.json').version

const parseArguments = (argv) => {
    return new Promise((resolve, reject) => {
        if (argv.filter == undefined || argv.filter == "")
            reject("Please enter a test category filter");
        else {
            resolve({
                "length": argv.filter.length,
                "data": argv.filter,
                "type": typeof (argv.filter)
            });
        }
    });
}


/**
 * Return all the test points assigned to the test plan which id is given if category is true
 * Or all the active, and failed test points if category is false
 * @param {Function} fetch 
 * @param {int} testPlandId 
 * @param {Int} testSuiteId 
 * @param {string} category 
 *  @param {string} projectName
 *  @param {string} tfsUrl
 */
exports.getAllTestPoints = (fetch, testPlandId, testSuiteId, category, projectName, tfsUrl) => {
    //  debugger
    if (projectName) {
        if (category.toUpperCase() === "ALL") {
            return fetch(`${Config.RunTestCaseServiceUrl}/GetAllTestPoints`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "testPlanId": JSON.parse(testPlandId),
                    "testSuiteId": JSON.parse(testSuiteId),
                    "TfsProjectName": projectName,
                    "TfsUserName": Config.defaultUser,
                    "TfsUrl": tfsUrl,
                    "testCaseId": Config.dummyId,
                    "onlyAutomatedTestPoints": true
                })
            })
                .then((reponse) => reponse.json(), (err) => console.error(err))
                .catch((error) => console.error(error))
        } else if (category.toUpperCase() === "FAILED AND ACTIVE") {
            return fetch(`${Config.RunTestCaseServiceUrl}/GetAllActiveAndFailedTestPoints`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "testPlanId": JSON.parse(testPlandId),
                    "testSuiteId": JSON.parse(testSuiteId),
                    "TfsProjectName": projectName,
                    "TfsUserName": Config.defaultUser,
                    "TfsUrl": tfsUrl,
                    "testCaseId": Config.dummyId,
                    "onlyAutomatedTestPoints": true
                })
            })
                .then((reponse) => reponse.json(), (err) => console.error(err))
                .catch((error) => console.error(error))
        }
        else if (category.toUpperCase() === "FAILED") {
            return fetch(`${Config.RunTestCaseServiceUrl}/GetAllFailedTestPoints`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "testPlanId": testPlandId,
                    "TfsProjectName": projectName,
                    "testSuiteId": JSON.parse(testSuiteId),
                    "TfsUserName": Config.defaultUser,
                    "TfsUrl": tfsUrl,
                    "testCaseId": Config.dummyId,
                    "onlyAutomatedTestPoints": true
                })
            })
                .then((reponse) => reponse.json(), (err) => console.error(err))
                .catch((error) => console.error(error))
        }
    } else {
        debug(`The project name is not set correctly`)
        return new Promise((resolve, reject) => {
            reject("The project name is not set correctly")
        })
    }
}
///slice an array to a number of array which length does not exceed max value
let reduceTestStack = (arr, temporaryValue, max) => {

    tempValu$e = temporaryValue
    if (arr.length <= max) {

        if (arr.length > 0)
            tempValue.push(arr)
        return tempValue
    }
    else {

        tempValue.push(arr.slice(0, max))

        return reduceTestStack(arr.slice(max, arr.length), tempValue, max)
    }
}

let parseTestPointsResult = (testPoints, testPlanId) => {

    return new Promise((resolve, reject) => {
        if (testPoints.length > 0) {
            // get all the config assigned to te test plan in an array 
            var config = testPoints.map((element) => {
                return element.configName
            })

            //Return an array of uniq value
            var uniqConfig = config.filter((value, index, self) => {
                return self.indexOf(value) === index;
            })

            //parse the testPoints array to obtained an object whome keys corresponds to the configs and value contains the test case id wich have been assigned to the config
            var listFinal = {}
            var unknow = uniqConfig.map(function (elt, index) {
                listFinal[elt] = []

                testPoints.forEach((function (entry, index2) {
                    if (entry.configName == elt) {
                        listFinal[elt].push("WI_" + testPlanId + "_" + entry.testCaseId)

                    }

                }))

                return listFinal
            })

            var res = unknow.filter(function onlyUnique(value, index, self) {
                return self.indexOf(value) === index;
            })
            var tempResult = Object.values(res[0]).map((arr, index) => {
                temp = []
                if (arr.length > MAX_TEST_BY_STACK)
                    temp = reduceTestStack(arr, temp, MAX_TEST_BY_STACK)
                else
                    temp.push(arr);
                return temp
            })
            const alteredList = _.flatten(tempResult, true)

            resolve(Object.values(res[0]))
            //resolve(alteredList)
        }
        else {
            resolve(testPoints)
        }
    })
}

/**
 * Get the hostname
 * @param {function} callback 
 */
const getHostname = (callback) => {
    require('child_process').spawn('hostname').stdout.on('data', (data) => {
        callback(data.toString('utf-8'))
    })
}


const sanityCheckHandler = (req, res) => {
    getHostname((hostname) => {

        // Get the URL and parse it
        const parsedUrl = url.parse(req.url, true)

        //Get the path 
        //get the untrimmed path
        const path = parsedUrl.pathname
        const trimmedPath = path.replace(/^\/+|\/+$/g, '')
        //get the query string as an object 
        const queryStringObject = parsedUrl.query
        //get the http method
        const method = req.method.toLowerCase()
        //Get the headers as an object
        const headers = req.headers
        //message
        const message = `runtestcase up and running on ${hostname} - version ${version} `
        //construct the data object to send to the handler
        const payload = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            message
        }
        // Convert the payload to a string 
        var payloadString = JSON.stringify(payload, null, 4) //payload send back by the handler to the user
        console.log(payloadString)
        //Send the response
        res.setHeader('Content-Type', 'text/html')
        res.writeHead(202)
        const html = `<body >
                    <div style="max-width:960px;margin:auto;text-decoration:none;">                      
                      <h4> ${payload.message}</h4>
                    </div>
                  </body>`
        res.end(html)

    })
}



exports.parseTestPointsResult = parseTestPointsResult

exports.runTestCase = runTestCase

exports.runTestCaseMac = runTestCaseMac

exports.reduceTestStack = reduceTestStack

exports.parseArguments = parseArguments

exports.sanityCheckHandler = sanityCheckHandler