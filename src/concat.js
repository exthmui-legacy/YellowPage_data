const through = require("through2");
const path = require("path");
const File = require("vinyl");
const Concat = require("concat-with-sourcemaps");

const fs = require("fs");

// file can be a vinyl file object or a string
// when a string it will construct a new one
module.exports = function (file, opt) {
    if (!file) {
        throw new Error("yp-concat: Missing file option");
    }
    opt = opt || {};

    // to preserve existing |undefined| behaviour and to introduce |newLine: ""| for binaries
    if (typeof opt.newLine !== "string") {
        opt.newLine = "\n";
    }

    let isUsingSourceMaps = false;
    let latestFile;
    let latestMod;
    let fileName;
    let concat;
    let result = {
        version: Math.ceil(Date.now() / 1000),
        status: 0,
        data: []
    };

    if (typeof file === "string") {
        fileName = file;
    } else if (typeof file.path === "string") {
        fileName = path.basename(file.path);
    } else {
        throw new Error("yp-concat: Missing path in file options");
    }

    function bufferContents(file, enc, cb) {
        // ignore empty files
        if (file.isNull()) {
            cb();
            return;
        }

        // set latest file if not already set,
        // or if the current file was modified more recently.
        if (!latestMod || file.stat && file.stat.mtime > latestMod) {
            latestFile = file;
            latestMod = file.stat && file.stat.mtime;
        }

        // construct concat instance
        if (!concat) {
            concat = new Concat(isUsingSourceMaps, fileName, opt.newLine);
        }

        const data = fs.readFileSync(file.path, "utf8");
        const json = JSON.parse(data);

        for (const i in json.data) {
            if (json.data.hasOwnProperty(i)) {
                let val = json.data[i];
                if (searchKey(result.data, "name", val.name) <= -1)
                    result.data.push(val);
            }
        }

        cb();
    }

    function endStream(cb) {
        // no files passed in, no file goes out
        if (!latestFile || !concat) {
            cb();
            return;
        }

        let joinedFile;

        // if file opt was a file path
        // clone everything from the latest file
        if (typeof file === "string") {
            joinedFile = latestFile.clone({contents: false});
            joinedFile.path = path.join(latestFile.base, file);
        } else {
            joinedFile = new File(file);
        }

        joinedFile.contents = Buffer.from(JSON.stringify(result));

        this.push(joinedFile);
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