import express from "express";
import http from "http";
import https from "https";
import fs from "fs";
import httpProxy from "http-proxy";

if (process.env.TARGET_PORT === undefined) {
  console.error("Pass valid PORT, passed port:", process.env.TARGET_PORT);
  process.exit(1);
}

const target = Number.parseInt(process.env.TARGET_PORT);

if (process.env.TARGET_PORT === undefined||target === NaN||!Number.isInteger(target)) {
  console.error("Pass valid PORT, passed port:", process.env.TARGET_PORT);
  process.exit(1);
}

const app = express();

app.all("*", (req, res) => {
  proxy.web(req, res, { target: `http://127.0.0.1:${target}` },(err)=>{
    if(err.message.includes("ECONNREFUSED")){
      console.log("the target server", `http://127.0.0.1:${target}`, "did not respond; check it is started and listening on port:", target)
      res.status(404)
      res.send(`the target server: http://127.0.0.1:${target} did not respond; check it is started and listening on port: ${target}`)
    }
  });
});

var key = fs.readFileSync(__dirname + "/selfsigned.key");
var cert = fs.readFileSync(__dirname + "/selfsigned.crt");
var options = {
  key: key,
  cert: cert,
};

//
// Setup our server to proxy standard HTTP requests
//
var proxy = httpProxy.createProxyServer({
  ssl: options,
  ws: true,
  target: {
    host: "localhost",
    port: target,
  },
  secure: true,
});

// your express configuration here

const httpServer = http.createServer(app);
const httpsServer = https.createServer(options, app);

httpServer.on("upgrade", function (req, socket, head) {
  proxy.ws(req, socket, head);
});
httpsServer.on("upgrade", function (req, socket, head) {
  proxy.ws(req, socket, head);
});

httpServer.listen(80, () => console.log("http proxy server started on: 80"));
httpsServer.listen(443, () => {
  console.log("https proxy server started on: 443");
  console.log("\nall requests proxied to:", `http://127.0.0.1:${target}`);
  console.log("\nopen:", `https://localhost`);
});
