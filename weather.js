/* Weather demo
 * Copyright SpreadsheetDB
 * https://www.spreadsheetdb.io
 */

var process = require("process");

var records = require("./records");
var server = require("./server");
var spreadsheet = require("./spreadsheet");

var authArgs = [];
var weatherRecordInterval = 5 * 60 * 1000;

function usage() {
    console.log("usage: node weather.js [--interval <ms>] email password");
    process.exit(0);
}

for (var i = 2; i < process.argv.length; i++) {
    if (process.argv[i] == "--interval") {
        weatherRecordInterval = parseInt(process.argv[i + 1]);
        if (weatherRecordInterval <= 0) {
            usage();
        }
        i++;
        continue;
    }

    authArgs.push(process.argv[i]);
}

if (authArgs.length != 2) {
    usage();
}

var auth = {
    user: authArgs[0],
    pass: authArgs[1]
}

spreadsheet.create(auth);
records.watchWeather(auth, weatherRecordInterval);

server.run(auth);
