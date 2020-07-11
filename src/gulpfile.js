const del = require("del");
const through2 = require("through2");

const {series, src, dest} = require("gulp");
const ava = require("gulp-ava");
const rename = require("gulp-rename");
const concat = require("./concat");
const concatFolders = require("./concat-folder");

const plugin_yellowPageData = require("./plugins/yellowpagedata");

const generator = () => {
    return src("data/*/*.yaml")
        .pipe(through2.obj(plugin_yellowPageData))
        .pipe(rename({extname: ".json"}))
        .pipe(dest("./out"));
};

const combine = () => {
    return src("out/*/*.json")
        .pipe(concatFolders("汇总"))
        .pipe(rename({extname: ".all.json"}))
        .pipe(dest("./out"));
}

const allInOne = () => {
    return src("out/汇总/*.all.json")
        .pipe(concat("全部.json"))
        .pipe(dest("./out"));
}

const test = () => {
    return src("./src/test.js")
        .pipe(ava({verbose: true}));
}

const clean = () => {
    return del([
        "out"
    ]);
};

exports.test = test;
exports.generator = generator;
exports.combine = combine;
exports.allinone = allInOne;
exports.build = series(test, clean, generator, combine, allInOne);
exports.update = series(test, clean, generator, combine, allInOne, post);
