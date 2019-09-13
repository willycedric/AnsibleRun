const app = require('./src/app')
const server = require('express')()
const { environmentToExport } = require('./config')
const { Logger } = require('./utils/Logger')
// if (process.argv[2]) {
//     Logger.info(`using the port passing as parameter ${process.argv[2]}`)
//     server.set('port', process.argv[2])
// }
// else {
//     Logger.info(`using the port ${process.env.PORT || SERVER_PORT}`)
//     server.set('port', process.env.PORT || SERVER_PORT)
// }
Logger.info(`using the port ${environmentToExport.httpPort || SERVER_PORT} - ${environmentToExport.envName} environment`)
server.set('port', environmentToExport.httpPort || SERVER_PORT)
//Starting the app 
app.init(server)