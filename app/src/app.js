const { spawn } = require('child_process');
var helper = require('./helper')
const cluster = require('cluster')
const { Logger } = require('../utils/Logger')
const { FILTER_SEPARATOR } = require('../config')
process.setMaxListeners(Infinity);
const EventEmitter = require('events');
const emitter = new EventEmitter();


emitter.setMaxListeners(11)

//check the execution platform
const isWin = process.platform === "win32";

const app = {
    init: (server) => {
        if (cluster.isMaster) {
          
            let slowRequestPids = {};
            //List of powershell sub process created
            let listOfPSProcess = []
            const bodyParser = require('body-parser')
            const timeout = require('connect-timeout')          
            const { TfsUrl } = require('./../config')
            const fetch = require('node-fetch')
            //default request timeout 2400s= 30 minutes
            server.use(timeout('21600s'))
            // Logger.debug(`Execution platform is ${process.platform}`);
            // parse application/x-www-form-urlencoded
            server.use(bodyParser.urlencoded({ extended: false }))
            // parse application/json
            server.use(bodyParser.json())
            //service sanity check endpoint
            server.get('*', (req, res)=>{
                helper.sanityCheckHandler(req,res)
            })
            //initial request to get all test points from the test plan
            server.post('/run', timeout('21600s'), (req, res, next) => {
                req.setTimeout(21600000, () => {
                    Logger.debug('setting timeout')
                })

                req.on('close', () => {
                    if (listOfPSProcess.length > 0 && Object.keys(slowRequestPids).length != 0) {
                        listOfPSProcess.forEach((pid) => {
                            Logger.info('Service has been interrupted by the remote host. Closing all the  subprocesse(s).')
                            const nuinitConsole = spawn('taskkill', ['/F', '/T', '/PID', pid])
                            nuinitConsole.stdout.on('data', (data) => console.log(data.toString('utf-8')))
                            nuinitConsole.stderr.on('data', (data) => console.error(data.toString('utf-8')))
                        })
                        listOfPSProcess.length = 0; //Empty the list of pwsh process
                    }
                    //@TODO: Find an other way to do that
                    //closing the remaining nunit-console process
                    //closing the remaining nunit-agent process

                    //  const nuinitConsole =spawn('taskkill',['/F', '/IM', 'nunit3-console.exe'])
                    //  const nunitAgent=spawn('taskkill',['/F', '/IM', 'nunit-agent.exe'])
                    //  nunitAgent.stdout.on('data', (data)=>console.log(data.toString('utf-8')))
                    //  nuinitConsole.stdout.on('data',(data)=>console.log(data.toString('utf-8')))
                })
                Logger.debug(`Incoming request  with parameters`)
                Logger.debug(`${JSON.stringify(req.body, null, 6)} `)
                workerCount = req.body.counter ? req.body.counter : 0
                const testPlanId = typeof (req.body.testPlanId) == 'string' && parseInt(req.body.testPlanId) > 0 ? parseInt(req.body.testPlanId) : false
                const testSuiteId = typeof (req.body.testSuiteId) == "string" && parseInt(req.body.testSuiteId) > 0 ? parseInt(req.body.testSuiteId) : 0
                const testCategory = typeof (req.body.category) == 'string' && req.body.category.trim().length > 0 ? req.body.category : false
                const runIndex = req.body.runIndex
                const testExecutablePath = typeof (req.body.path) == 'string' && req.body.path.trim().length > 0 ? req.body.path : false
                const type = req.body.type ? req.body.type : 'BSC'
                const isMultiStack = (req.body.multistack === undefined) ? true : (req.body.multistack.toUpperCase() === "NONE") ? false : true
                const projectName = (req.body.project === "" ? undefined : req.body.project) || false
                const tfsUrl = (req.body.tfsUrl == "" ? undefined : req.body.tfsUrl) || TfsUrl


                Logger.debug(`Suite id ${req.body.testSuiteId}`)
                Logger.debug(`The targeted project name ${projectName}`)
                Logger.debug(`The targeted repo  ${tfsUrl}`)
                Logger.debug(`Targeted test plan Id ${testPlanId}`)
                Logger.debug(`Test Executable path ${testExecutablePath}`)
                Logger.debug(`TestSuite Id ${testSuiteId}`)


                Logger.debug(`Get all the test points in test plan ${testPlanId} `)

                helper.getAllTestPoints(fetch, testPlanId, testSuiteId, testCategory, projectName, tfsUrl)
                    .then((data) => {
                        if (isMultiStack) {
                            /**
                             * The tests will be executed in multiprocess
                             */

                            helper.parseTestPointsResult(data, testPlanId)
                                .then((rep) => {
                                    //Build test stacks with a number of test which doesn't exceed MAX_TEST_BY_STACK value           
                                    var outResult = rep.map((arr) => {
                                        var tmp = "cat="
                                        arr.forEach((elt, ind) => {
                                            ind == 0 ? tmp = tmp + elt : tmp = tmp + FILTER_SEPARATOR + elt
                                        })
                                        return tmp
                                    })
                                    Logger.debug(`Building ${outResult.length} stack(s)`)
                                    //outResult.length=0
                                    if (outResult.length > 0) {
                                        outResult.forEach((category, index) => {

                                            const worker = cluster.fork()
                                            //slowRequestPids.push(worker)
                                            // Listen for messages from worker         

                                            var testResultIndex = index + "_" + runIndex

                                            worker.on('message', (msg) => {
                                                if (msg.hasOwnProperty('fork')) {
                                                    slowRequestPids[msg.fork] = 1
                                                } else {
                                                    listOfPSProcess.push(msg)
                                                }

                                            })
                                            //Increase the number of subprocess
                                            workerCount++
                                            //send message to the worker with the category and index
                                            worker.send({ category, testResultIndex, testExecutablePath, type, projectName })

                                            //respond when there is no active cluster
                                            cluster.on('exit', (worker) => {
                                                workerCount--
                                                var pidString = String(worker.process.pid)
                                                if (pidString in slowRequestPids) {
                                                    delete slowRequestPids[pidString]
                                                }
                                                if (Object.keys(slowRequestPids).length === 0 && slowRequestPids.constructor === Object) {
                                                    return next()
                                                    //process.exit()
                                                }
                                            })
                                        })
                                    } else {
                                        return next()
                                    }
                                })
                                .catch((err) => {
                                    Logger.error(err)
                                })
                        }
                        else {

                            if (data.length > 0) {

                                /***
                                 * All the test case will be run in a single process
                                 */
                                //Logger.debug(`data ==> ${JSON.stringify(data.map(entry=>entry.testCaseId), null, 6)}`)
                                const workItemsList = data.map(entry => "WI_" + testPlanId + "_" + entry.testCaseId)
                                const temp = []
                                temp.push(workItemsList)
                                var outResult = temp.map((arr) => {
                                    var tmp = "cat="
                                    arr.forEach((elt, ind) => {
                                        ind == 0 ? tmp = tmp + elt : tmp = tmp + FILTER_SEPARATOR + elt
                                    })
                                    return tmp
                                })
                                Logger.info(`List of work items to be executed  in a single process \n ${outResult[0]}`)
                                if (outResult[0] !== "") {

                                    const worker = cluster.fork()
                                    //slowRequestPids.push(worker)
                                    // Listen for messages from worker       
                                    var testResultIndex = "0" + "_" + runIndex
                                    worker.on('message', (msg) => {

                                        if (msg.hasOwnProperty('fork')) {
                                            slowRequestPids[msg.fork] = 1
                                        } else {
                                            listOfPSProcess.push(msg)
                                        }

                                    })
                                    //Increase the number of subprocess
                                    workerCount++

                                    //send message to the worker with the category and index
                                    worker.send({ category: outResult[0], testResultIndex, testExecutablePath, type, projectName })

                                    //respond when there is no active cluster
                                    cluster.on('exit', (worker) => {
                                        workerCount--
                                        var pidString = String(worker.process.pid)
                                        if (pidString in slowRequestPids) {
                                            delete slowRequestPids[pidString]
                                        }
                                        if (Object.keys(slowRequestPids).length === 0 && slowRequestPids.constructor === Object) {
                                            return next()
                                        }
                                    })
                                }
                            }
                            else {
                                return next()
                            }
                        }


                    })
                    .catch((err) => {
                        Logger.error("Error " + err)
                        next()
                    })



            }, (req, res) => {
                Logger.debug('Test finished !')
                res.status(202).send("Test done ....\n")
            })

            server.listen(server.get('port'), () => {
                Logger.debug(`app listening on port ${server.get('port')}!`);
            })
        }
        else {
            workerCount = 0
            process.on('message', (message) => {
                Logger.debug(`Worker ${process.pid} recevies message '${JSON.stringify(message)}'`);
                if (isWin) {
                    helper.runTestCase(message.category, message.testResultIndex, message.testExecutablePath, message.type, message.projectName)
                        .then((res) => {
                            Logger.debug(`process ${process.pid} exited with the ouput ${res}`)
                            process.exit()
                        }, (err) => {
                            Logger.error('An error occured ', err)
                            process.exit()
                        })
                }
                else {
                    helper.runTestCaseMac(message.category, message.testResultIndex, message.testExecutablePath, message.type, message.projectName)
                        .then((res) => {
                            Logger.debug(`process ${process.pid} exited with the ouput ${res}`)
                            process.exit()
                        }, (err) => {
                            Logger.error('An error occured ', err)
                            process.exit()
                        })
                }
            })
            process.send({ fork: process.pid });
        }
    }
}

module.exports = app


