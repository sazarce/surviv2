var http = require('http');
var fs = require('fs')
var path = require('path')
var zlib = require('zlib')


var mkdirp = require('mkdirp')
var Readable = require('stream').Readable;
require('./background.js')()

var httpServer = http.createServer(onRequest).listen(process.env.PORT || 3000);
console.log("Listening on " + (process.env.PORT || 3000))
const websocket = require('websocket')
const wss = websocket.server;
var WebSocketClient = websocket.client;
wsServer = new wss({
	httpServer: httpServer
})
wsServer.on('request', function(request){
	console.log("Request" + request)
	var connection = request.accept(null, request.origin);
	var client = new WebSocketClient();
	var messageBuffer = [];
	connection.on('message', function(message){
		if (message){
			console.log("Received message: " + message.utf8Data);
			messageBuffer.push(message);
		}
	})
	client.on('connect', function(connection2){
		console.log("Client connected");
		connection2.on('message', function(message){
			console.log("Received " + message.utf8Data)
			connection.sendUTF(message.utf8Data);
		})
		connection.on('message', function(){
			while(messageBuffer.length > 0){
				console.log("Send message " + messageBuffer[0].utf8Data);
				connection2.sendUTF(messageBuffer[0].utf8Data)
				messageBuffer.shift();
			}
		})
		connection2.on('close', function(){
			console.log("Client connection closed");
			connection.close();
		})
		connection.emit('message')
	})
	client.connect('ws://surviv.io' + request.resourceURL.path);
});
function onRequest(client_req, client_res) {

    var response = client_res;
    console.log(client_req.url)
    if (!client_req.url.includes("team") && !client_req.url.includes("api") && client_req.url != "/" && client_req.method != "POST" && fs.existsSync(path.join(__dirname, 'public', client_req.url))) {
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
                //console.log("Data: " + queryData);
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
                //console.log(client_req.headers)
                var post_req = http.request(post_options, function(res) {
                	var gunzip = zlib.createGunzip();

                    var body = '';
                    res.pipe(gunzip)
                    gunzip.on('data', function(d){
                    	body += d;
                    })
                    gunzip.on('end', function(){
                    	//console.log(res.headers);
                    	//console.log(body)

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
                
                //console.log("Download " + (fileName + ".headers"));
                //console.log(JSON.stringify(proxyRes.headers))

                if (client_req.url.split('.').pop() == "js"){
                	var details = {
                		url: "http://surviv.io" + client_req.url,

                	}
                	listener(details, function(code){

                		if (client_req.url.includes("app")){
                			//fs.writeFileSync("test.js", code)
                		}
                		//proxyRes.headers['Content-Length'] = code.length;
                		//console.log(proxyRes.headers)
                		var newHeaders = proxyRes.headers;
                		newHeaders['content-length'] = Buffer.byteLength(code);
                		client_res.writeHead(200, proxyRes.headers);
                		client_res.end(code);
                	});
                	//console.log("Injected code: " + injectedCode);
                	return;
                }
                var buffer = Buffer.concat(data);
                //console.log(proxyRes.headers)
                client_res.writeHead(200, proxyRes.headers);
                client_res.end(buffer);
                var fileName = path.join(__dirname, 'public', client_req.url);
                mkdirp(path.dirname(fileName), function(err) {})
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