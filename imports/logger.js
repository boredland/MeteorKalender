var base = process.env.PWD;

var consoleOptions = {
    colorize: true,
    level: 'debug',
    levels : {debug: 0, info : 1, warn: 2, error: 3},
    colors : {debug: 'blue', info : 'green', warn: 'orange', error: 'red'},
    handleExeptions: true,
    humanReadableUnhandledException: true,
};

var fileOptions = {
    name: 'file.error',
    filename: base + '/meteor.log',
    colorize: true,
    level : 'debug',
    levels : {debug: 0, info : 1, warn: 2, error: 3},
    colors : {debug: 'blue', info : 'green', warn: 'orange', error: 'red'},
    json: true,
    handleExeptions: true,
};

logger.addTransport('file', fileOptions);
logger.addTransport('console', consoleOptions);