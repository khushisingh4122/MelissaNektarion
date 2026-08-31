// apps/api/src/main.js

import http from "http";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("API is running 🚀");
});

server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});