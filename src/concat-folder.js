const through = require("through2");
const path = require("path");
const Vinyl = require("vinyl");
const ConcatSourceMaps = require("concat-with-sourcemaps");
const os = require("os");

const fs = require("fs");
const yaml = require("js-yaml");

// file can be a vinyl file object or a string
// when a string it will construct a new one
module.exports = function (base, opts) {
    opts = opts || {};

    // to preserve existing |undefined| behaviour and to introduce |newLine: ""| for binaries
    if (typeof opts.newLine !== "string") {
        opts.newLine = os.EOL;
    }

    let isUsingSourceMaps = false;
    let files = {};
    let latestMod;
    let latestExt;
    let result = {};
    let template = () => {
        return {
            version: Date.now(),
            status: 0,
            data: []
        };
    };

    function bufferContents(file, enc, cb) {
        if (base == null) {
            base = file.base;
        }

        // ignore empty files
        if (file.isNull()) {
            cb();
            return;
        }

        // set latest file if not already set,
        // or if the current file was modified more recently.
        if (!latestMod || file.stat && file.stat.mtime > latestMod) {
            latestMod = file.stat && file.stat.mtime;
        }

        // ignore files in the base folder
        if (file.relative.includes(path.sep)) {
            let parsedPath = path.parse(file.relative);
            let filePath = file.relative.split(path.sep);
            let folder = filePath.shift();

            // construct concat instance
            if (files[folder] == null) {
                files[folder] = new ConcatSourceMaps(isUsingSourceMaps, `${folder}${parsedPath.ext}`, opts.newLine);
            }
            // construct data instance
            if (result[folder] == null) {
                result[folder] = template();
            }

            const data = fs.readFileSync(file.path, "utf8");
            const json = yaml.load(data);

            for (let i in json.data) {
                if (json.data.hasOwnProperty(i)) {
                    let val = json.data[i];
                    if (searchKey(result[folder].data, "name", val.name) <= -1)
                        result[folder].data.push(val);
                }
            }

            latestExt = parsedPath.ext;
        }

        cb();
    }

    function endStream(cb) {
        // no files passed in, no file goes out
        if (files === {}) {
            cb();
            return;
        }

        for (let folder in files) {
            let concat = files[folder];
            let file = new Vinyl(concat);
            file.path = path.join(base, `${folder}${latestExt}`);
            file.contents = Buffer.from(JSON.stringify(result[folder]));

            this.push(file);
        }

        cb();
    }

    return through.obj(bufferContents, endStream);
}


const searchKey = (arr, key, keyValue) => {
    for (let i = 0; i < arr.length; i++) {
        if ((arr[i][key]).indexOf(keyValue) > -1) return i;
    }
    return -1;
}