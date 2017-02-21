/* Weather demo
 * Copyright SpreadsheetDB
 * https://www.spreadsheetdb.io
 */

var http = require("http");
var request = require("request");

(function() {
    var getMaximums = (function(ss) {
        var xMax = 0;
        var yMax = 0;

        for (var coords in ss) {
            var parts = coords.split(/,/);
            var x = parseInt(parts[0]);
            var y = parseInt(parts[1]);

            if (x > xMax) {
                xMax = x;
            }
            if (y > yMax) {
                yMax = y;
            }
        }

        return [xMax, yMax];
    });

    var buildHTML = (function(ss, xMax, yMax) {
        /* Build an HTML page from the spreadsheet object. */

        var html = '<html><head><meta charset="UTF-8" />' +
            "<style> .spreadsheet { table-layout: fixed; border-collapse:"+
            "collapse;}.spreadsheet td { border: solid 1px #e7e7e7;"+
            "text-overflow: ellipsis; white-space: nowrap; overflow: hidden;"+
            "text-align: center;}.spreadsheet div { padding: 1px; width:"+
            "130px; min-width: 130px; max-width: 130px; overflow: auto;}"+
            '</style></head><body><table class="spreadsheet">';

        for (var y = 0; y < yMax + 1; y++) {
            html += "<tr>";
            for (var x = 0; x < xMax + 1; x++) {
                var coords = x + "," + y;
                var res = "";

                if (coords in ss) {
                    if ("result" in ss[coords]) {
                        res = ss[coords].result;
                    } else {
                        res = ss[coords].value;
                    }
                }

                html += "<td><div>" + res + "</div></td>";
            }
            html += "</tr>";
        }

        html += "</body></table>";

        return html;
    });

    module.exports.run = (function(auth) {
        http.createServer(function(rq, response) {
            request({
                url: "http://api.spreadsheetdb.io/"+
                    "spreadsheet/weather?notation=x,y",
                auth: auth,
            }, function(error, resp, body) {
                try {
                    body = JSON.parse(body);
                } catch(e) {
                    fatal("cannot parse body:", e);
                }

                if (body.error != undefined) {
                    response.writeHead(400);
                    return response.end(
                        "<p>" + body.error + ": " + body.text + "</p>");
                }

                var ss = body.spreadsheet.cells;
                var maxs = getMaximums(ss);
                var html = buildHTML(ss, maxs[0], maxs[1]);

                response.writeHead(200);
                response.end(html);
            });
        }).listen(8000)

        console.log("Server running at http://127.0.0.1:8000/");
    });
})();

