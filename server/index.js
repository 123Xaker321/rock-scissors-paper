let http = require("http");
const PORT = "8080";

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end("Hello server!");
}).listen(PORT);
console.log(`server listening on http://127.0.0.1:${PORT}`)