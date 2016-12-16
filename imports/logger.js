var base = process.env.PWD;

var consoleOptions = {
    colorize: true,
    level: 'debug',
    levels : {debug: 0, info : 1, warn: 2, error: 3},
    colors : {debug: 'blue', info : 'green', warn: 'orange', error: 'red'},
    handleExeptions: true,
    humanReadableUnhandledException: true,
};

var fileDebugOptions = {
    name: 'file.debug',
    filename: base + '/meteor-debug.log',
    colorize: true,
    level : 'debug',
    levels : {debug: 0, info : 1, warn: 2, error: 3},
    colors : {debug: 'blue', info : 'green', warn: 'orange', error: 'red'},
    json: true,
    handleExeptions: true,
};

var fileErrorOptions = {
    name: 'file.error',
    filename: base + '/meteor-error.log',
    colorize: true,
    level : 'error',
    levels : {debug: 0, info : 1, warn: 2, error: 3},
    colors : {debug: 'blue', info : 'green', warn: 'orange', error: 'red'},
    json: true,
    handleExeptions: true,
};

logger.addTransport('file', fileDebugOptions);
logger.addTransport('file', fileErrorOptions);
logger.addTransport('console', consoleOptions);