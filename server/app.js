var http = require('http');
var fs = require('fs')
var path = require('path')
var gunzip = require('zlib').createGunzip()
var mkdirp = require('mkdirp')
http.createServer(onRequest).listen(3000);
require('longjohn')

function onRequest(client_req, client_res) {

    var response = client_res;
    if (client_req.url != "/" && client_req.method != "POST" && fs.existsSync(path.join(__dirname, 'public', client_req.url))) {
        fs.readFile(path.join(__dirname, 'public', client_req.url), function(err, data) {
            //console.log("Cached " + client_req.url)
            client_res.end(data);
        })
    } else {
        console.log('serve: ' + client_req.url);
        var options = {
            hostname: 'www.surviv.io',
            port: 80,
            path: client_req.url,
            method: client_req.method
        };
        if (client_req.method == "POST") {
            var queryData = "";
            client_req.on('data', function(data) {
                queryData += data;
            });
            client_req.on('end', function() {
                client_req.post = queryData;
                console.log("Data: " + queryData);
                var post_options = {
                    host: 'www.surviv.io',
                    port: 80,
                    path: client_req.url,
                    method: 'POST',
                    headers: client_req.headers
                };
                post_options.headers.host = "surviv.io";
                post_options.headers.origin = "http://surviv.io";
                post_options.headers.referer = "http://surviv.io";
                console.log(client_req.headers)
                var post_req = http.request(post_options, function(res) {
                    res.on('data', function(chunk) {
                        console.log('Response ' + chunk.toString())
                    })
                    var body = '';
                    res.pipe(gunzip)
                    gunzip.on('data', function(d){
                    	body += d;
                    })
                    gunzip.on('end', function(){
                    	console.log(JSON.parse(body))
                    })
                })
                post_req.write(queryData)
                post_req.end()
            })
            //client_res..redirect(307, "http://surviv.io" + client_req.url);
            //console.log(client_req)
            return
        }
        var data = [];
        http.get(options, function(proxyRes) {
            proxyRes.on('data', function(chunk) {
                data.push(chunk);
            });
            proxyRes.on('end', function() {
                var buffer = Buffer.concat(data);
                client_res.end(buffer);
                var fileName = path.join(__dirname, 'public', client_req.url);
                mkdirp(path.dirname(fileName), function(err) {})
                //console.log("Download " + fileName);
                fs.writeFile(fileName, buffer, function(err) {

                });
                //console.log("Finish " + client_req.url)
            })
            proxyRes.on('error', function(e) { console.log("Exception " + JSON.stringify(e)) })
        }).on('error', function(e) {
            console.log("Error: " + JSON.stringify(e));
            console.log(client_req.url)
        })
    }
}