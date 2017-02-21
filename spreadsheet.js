/* Weather demo
 * Copyright SpreadsheetDB
 * https://www.spreadsheetdb.io
 */

var fs = require("fs");
var process = require("process");
var request = require("request");

(function() {
    var exists = (function(auth, cb) {
        request({
            url: "http://api.spreadsheetdb.io/spreadsheet/weather",
            auth: auth
        }, function(error, resp, body) {
            if (error != undefined) {
                console.error("cannot get spreadsheet:", error);
                process.exit(1);
            }

            if (resp.statusCode >= 500) {
                console.error("cannot get spreadsheet:", resp.statusCode);
                process.exit(1);
            }

            cb(resp.statusCode != 404);
        });
    });

    var insert = (function(auth) {
        /* Read the spreadsheet */
        try {
            var file = __dirname + "/spreadsheet.json";
            var content = fs.readFileSync(file).toString();
        } catch(e) {
            console.error("cannot read", file, e);
            process.exit(1);
        }

        /* Parse the spreadsheet. */
        try {
            var spreadsheet = JSON.parse(content);
        } catch(e) {
            console.error("cannot parse spreadsheet json", e);
            process.exit(1);
        }

        /* Post the spreadsheet, see
         * http://www.spreadsheetdb.io/doc/api#post-spreadsheet
         */
        request({
            url: "http://api.spreadsheetdb.io/spreadsheet",
            auth: auth,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: spreadsheet
        }, function(error, response, body) {
            if (error != undefined) {
                console.error("cannot create spreadsheet:", error);
                process.exit(1);
            }

            if (response.statusCode >= 400) {
                console.error("cannot create spreadsheet: status code " +
                              response.statusCode);
                process.exit(1);
            }

            if (body.error != undefined) {
                if (body.error == "AlreadyExists") {
                    /* Spreadsheet has already been created, nothing to do. */
                    return;
                }

                console.error("cannot create spreadsheet:", body.error, body.text);
                process.exit(1);
            }

            console.log("spreadsheet created");
        });
    });

    module.exports.create = (function(auth) {
        exists(auth, function(res) {
            if (res == false) {
                /* The spreadsheet doesn't exist, let's insert it. */
                insert(auth);
            }
        });
    });

})()
