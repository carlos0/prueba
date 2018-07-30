var  winston = require("winston");
var packageJson = require("./package.json");
var getNamespace = require('continuation-local-storage').getNamespace;
var loggerContinuation2 = getNamespace('logger');

var logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: true,
            colorize: true,
            prettyPrint: true,
            humanReadableUnhandledException: true,
        }),
        /*
        new winston.transports.Http({
            host: '192.168.27.231',
            port: '8888',
            path: '/debug.test',
        }),
        */
        new winston.transports.Http({
            host: '192.168.27.237',
            port: '8080',
        }),
    ],
    exitOnError: false,
});

logger.rewriters.push(function(level, msg, meta) {
  meta['logId'] = loggerContinuation2.get('logId')
  meta['timestamp'] = new Date();
  meta['appName'] = packageJson.name;
  return meta;
});

module.exports = logger;
