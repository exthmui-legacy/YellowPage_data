module.exports = async (path, cb) => {
    let config = require("../../configuration.json");

    const fs = require("fs");
    const http = require("http");
    
    const contents = fs.readFileSync(path);

    const options = {
        host: config.post.host,
        path: config.post.path,
        port: config.post.port,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": contents.length,
            "Authorization": config.post.token
        }
    };

    const req = http.request(options, function (res) {
        res.setEncoding("utf8");
    });

    req.write(contents);
    req.end();
    await cb();
};