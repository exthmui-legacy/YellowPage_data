import fs from "fs";
import test from "ava";
import globby from "globby";
import isPng from "is-png";
import yaml from "js-yaml";
import readChunk from "read-chunk";
import imageSize from "image-size";
import prettyBytes from "pretty-bytes";
import data_schema from "./data_schema";

const checkImage = (t, path) => {
    const buffer = readChunk.sync(path, 0, 8);
    if (!isPng(buffer)) {
        t.fail("图片格式不合法");
    }
    const dimensions = imageSize(path);
    if (dimensions.width !== 200 || dimensions.height !== 200) {
        t.fail(`图片尺寸不合法 ${dimensions.width}x${dimensions.height}`);
    }
    const lstat = fs.lstatSync(path)
    if (lstat.size > 1024 * 20) {
        t.fail(`图片文件体积超过限制 ${prettyBytes(lstat.size)}`)
    }
    t.pass()
}

const checkData = (t, path) => {
    const data = fs.readFileSync(path, "utf8");
    const json = yaml.load(data);

    let result = data_schema.validate.validateData(json);
    if (result.error) {
        t.fail(result.error.message);
    }

    for (let phone of json.phone) {
        if (phone.number.toString().substr(0, 3) === "106") {
            t.fail("不收录 106 短信通道号码");
        }
    }

    t.pass()
}

const app = async () => {
    const paths = await globby("data/*/*.yaml");
    for (const path of paths) {
        const type = path.split("/")[1];
        const name = path.split("/")[2].split(".")[0];
        test(`Image of ${type} • ${name}`, checkImage, `data/${type}/${name}.png`);
        test(`Data of ${type} • ${name}`, checkData, `data/${type}/${name}.yaml`);
    }

}

app().then(() => {
})
