 /* Weather demo
 * Copyright SpreadsheetDB
 * https://www.spreadsheetdb.io
 */

var request = require("request");

/* Yahoo Weather API URLs. */
var weatherUrls = [
    /* Paris, France. */
    "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather"+
    ".forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)"+
    "%20where%20text%3D%22paris%2C%20france%22)&format=json&env=store%3A%2F%"+
    "2Fdatatables.org%2Falltableswithkeys",

    /* Nairobi, Kenya. */
    "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather"+
    ".forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)"+
    "%20where%20text%3D%22nairobi%2C%20kenya%22)&format=json&env=store%3A%2F"+
    "%2Fdatatables.org%2Falltableswithkeys",

    /* Tokyo, Japan. */
    "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather"+
    ".forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)"+
    "%20where%20text%3D%22tokyo%2C%20japan%22)&format=json&env=store%3A%2F%"+
    "2Fdatatables.org%2Falltableswithkeys",
];

(function() {
    var recordWeather = (function(url, auth, weatherUrl) {
        request(weatherUrl, function(error, response, body) {
            if (error != undefined) {
                return console.error("cannot get weather:", error)
            }

            try {
                var weather = JSON.parse(body);
            } catch(e) {
                return console.error("cannot parse weather:", e);
            }

            try {
                var channel = weather.query.results.channel;
            } catch(e) {
                return console.error(
                    "cannot record weather: cannot get yahoo api channel");
            }

            if (!channel)
                return console.error("channel is empty");

            /* Inserts the weather record, see
             * http://www.spreadsheetdb.io/doc/api#post-record
             */
            request({
                url: url + "/record",
                auth: auth,
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: {
                    key: "weather",
                    data: channel
                }
            }, function(error, response, body) {
                if (error != undefined)
                    return console.error("cannot insert record:", error);

                if (response.statusCode >= 400)
                    return console.error(
                        "cannot insert record: status code " +
                        response.statusCode);

                if (body.error != undefined)
                    return console.error(
                        "cannot insert record", body.error, body.text);
            });
        });
    });

    module.exports.watchWeather = (function(url, auth, weatherRecordItvl) {
        /* Record weather on startup. */
        for (var i = 0; i < weatherUrls.length; i++) {
            recordWeather(url, auth, weatherUrls[i]);
        }

        /* Set the weather recording loop. */
        setInterval(function() {
            for (var i = 0; i < weatherUrls.length; i++) {
                recordWeather(url, auth, weatherUrls[i])
            }
        }, weatherRecordItvl);
    });
})();
