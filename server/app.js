var http = require('http');
var fs = require('fs')
var path = require('path')
var zlib = require('zlib')
var mkdirp = require('mkdirp')
var Readable = require('stream').Readable;
http.createServer(onRequest).listen(3000);
require('longjohn')

function onRequest(client_req, client_res) {

    var response = client_res;
    if (!client_req.url.includes("api") && client_req.url != "/" && client_req.method != "POST" && fs.existsSync(path.join(__dirname, 'public', client_req.url))) {
        fs.readFile(path.join(__dirname, 'public', client_req.url), function(err, data) {
            //console.log("Cached " + client_req.url)
            fs.readFile(path.join(__dirname, 'public', client_req.url + ".headers"), function(err, data2){
            	client_res.writeHead(200, JSON.parse(data2));
            	client_res.end(data);
            })
            
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
                    headers: client_req.headers,

                };
                post_options.headers.host = "surviv.io";
                post_options.headers.origin = "http://surviv.io";
                post_options.headers.referer = "http://surviv.io";
                console.log(client_req.headers)
                var post_req = http.request(post_options, function(res) {
                	var gunzip = zlib.createGunzip();

                    var body = '';
                    res.pipe(gunzip)
                    gunzip.on('data', function(d){
                    	body += d;
                    })
                    gunzip.on('end', function(){
                    	//console.log(res.headers);
                    	console.log(body)

                    	client_res.writeHead(200, res.headers)
                    	
                    	var s = new Readable();
                    	s._read = function(){};
                    	s.push(body);
                    	s.push(null);
                    	s.pipe(zlib.createGzip()).pipe(client_res);
                    })
                })
                post_req.write(queryData, function(e){post_req.end()})

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
                console.log(proxyRes.headers)
                client_res.writeHead(200, proxyRes.headers);
                client_res.end(buffer);
                var fileName = path.join(__dirname, 'public', client_req.url);
                mkdirp(path.dirname(fileName), function(err) {})
                console.log("Download " + (fileName + ".headers"));
                console.log(JSON.stringify(proxyRes.headers))

                fs.writeFile(fileName, buffer, function(err) {

                });
                fs.writeFile(fileName + ".headers", JSON.stringify(proxyRes.headers), function(err){if (err) console.log(err)})
                //console.log("Finish " + client_req.url)
            })
            proxyRes.on('error', function(e) { console.log("Exception " + JSON.stringify(e)) })
        }).on('error', function(e) {
            console.log("Error: " + JSON.stringify(e));
            console.log(client_req.url)
        })
    }
}