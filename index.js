const http = require("http");
const fs = require("fs");
const fetch = require("node-fetch");

const indexHtml = fs.readFileSync("./index.html", "utf8");

const server = http.createServer(async (req, res) => {
  if (req.method === "GET") {
    // Serve the HTML demo page
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(indexHtml);
    return;
  }

  if (req.method === "POST") {
    let body = [];
    req.on("data", chunk => body.push(chunk));
    req.on("end", async () => {
      body = Buffer.concat(body).toString();

      // Server-side info
      const ip = req.socket.remoteAddress.replace("::ffff:", "");
      const ua = req.headers["user-agent"];
      const lang = req.headers["accept-language"];
      const ref = req.headers["referer"];

      // Optional geolocation from IP
      let geo = {};
      try {
        const r = await fetch(`https://ipapi.co/${ip}/json/`);
        geo = await r.json();
      } catch (err) {
        geo.error = "Geo lookup failed";
      }

      const result = {
        from_server: {
          ip,
          geolocation: geo,
          user_agent: ua,
          language: lang,
          referrer: ref || null
        },
        from_browser: body ? JSON.parse(body) : {}
      };

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result, null, 2));
    });
  }
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Demo running on port 3000 → accessible from outside of this server if firewall allows");
});
