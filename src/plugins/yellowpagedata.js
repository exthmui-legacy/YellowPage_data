const fs = require("fs");
const yaml = require("js-yaml");
const YPDataJS = require("../YellowPageData");

let config = require("../../configuration.json");

const plugin = (file, _, cb) => {
    let avatarServer = config.avatar_server;

    const path = file.path;
    const data = fs.readFileSync(path, "utf8");
    const json = yaml.load(data);

    let YPData = YPDataJS();
    for (const [key, value] of Object.entries(json)) {
        YPData[key] = value;
    }
    while (avatarServer.endsWith("/")) {
        avatarServer = avatarServer.substr(0, avatarServer.length - 1);
    }

    YPData.avatar = avatarServer + "/" + path.replace(".yaml", ".png").substring(path.lastIndexOf("/", path.lastIndexOf("/") - 1) + 1);
    const contents = {
        version: Date.now(),
        status: 0,
        data: [
            YPData
        ]
    };
    file.contents = Buffer.from(JSON.stringify(contents))
    cb(null, file)
}

module.exports = plugin