var should = require('should');
var promisify = require("util").promisify;
let path = require('path');
let hljs = require("highlight.js");
const fs = require("fs");
let hljsDefineCshtmlRazor = require("../src/languages/cshtml-razor");

const readdir = promisify(fs.readdir),
      readFile = promisify(fs.readFile);

describe("CSHTML Razor Tests", () => { 
    beforeEach(() => {
        hljs.registerLanguage('cshtml-razor', hljsDefineCshtmlRazor);
    });
    it("should generate correct markup", async () => {
        var files = await readdir(path.join(__dirname, "markup", "cshtml-razor"));
        files = files.filter(f => !f.includes(".expect."));
        for(var f of files) {
            let fn = path.join(__dirname, "markup", "cshtml-razor", f);
            let expectFn = fn.replace(".txt", ".expect.txt");
            var code = await readFile(fn, "utf-8");
            var exp = await readFile(expectFn, "utf-8");
            var actual = hljs.highlight("cshtml-razor", code).value;
            actual.trim().should.eql(exp.trim(), f);
        }
    });
    it("should be detected correctly", async () => {
        var code = await readFile(path.join(__dirname, 'detect', "cshtml-razor", "default.txt"), "utf-8");
        var actual = hljs.highlightAuto(code).language;
        actual.should.eql("cshtml-razor");
    });
});