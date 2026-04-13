const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT) || 3000;

const contentTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8"
};

const server = http.createServer((req, res) => {
    const requestedPath = req.url === "/" ? "/index.html" : req.url;
    const safePath = path.normalize(decodeURIComponent(requestedPath)).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(root, safePath);

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Not found");
            return;
        }

        res.writeHead(200, {
            "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream"
        });
        res.end(content);
    });
});

server.listen(port, () => {
    console.log(`Frontend running at http://localhost:${port}`);
});
