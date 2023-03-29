let app = require("http").createServer(handler),
  io = require("socket.io").listen(app),
  fs = require("fs"),
  url = require("url"),
  port = process.env.PORT || 5600,
  queue = {
    W: [],
    B: [],
    U: [],
  };

app.listen(port);
console.log("HTTP server listening on port " + port);
function handler(req, resp) {
  let r_url = url.parse(req.url);
  if (r_url.pathname.substring(1) === "getport") {
    resp.writeHead(200, { "Content-Type": "text/plain" });
    resp.write("" + port);
    resp.end();
  }
}