module.exports = async (path, cb) => {
    let config = require("../../configuration.json");

    let protocol = require("http");
    if (config.post.protocol === "https") protocol = require("https");

    const fs = require("fs");

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

    const req = protocol.request(options, function (res) {
        res.setEncoding("utf8");
    });

    req.write(contents);
    req.end();
    await cb();
};