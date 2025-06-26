var should = require('should');
var promisify = require("util").promisify;
let path = require('path');
let hljs = require("highlight.js");
const fs = require("fs");
let hljsDefineCshtmlRazor = require("../src/languages/cshtml-razor");

const readdir = promisify(fs.readdir),
      readFile = promisify(fs.readFile);

async function testMarkupGeneration(fileName) {
    const codeFn = path.join(__dirname, "markup", "cshtml-razor", `${fileName}.txt`);
    const expectedFn = path.join(__dirname, "markup", "cshtml-razor", `${fileName}.expect.txt`);

    const code = (await readFile(codeFn, "utf-8")).trim();
    const expectedMarkup = (await readFile(expectedFn, "utf-8")).trim();

    const actualMarkup = hljs.highlight("cshtml-razor", code).value.trim();
    actualMarkup.should.eql(expectedMarkup, `Markup for ${fileName} does not match expected output.

📄 Source code:
${code}

✅ Expected generated markup:
${expectedMarkup}
            
❌ Actual generated markup:
${actualMarkup}`);
}


describe("CSHTML Razor Tests", () => { 
    beforeEach(() => {
        hljs.registerLanguage('cshtml-razor', hljsDefineCshtmlRazor);
    });
    
    it("should generate correct markup - code-block-multiline", async () => {
        await testMarkupGeneration("code-block-multiline");
    });
    it("should generate correct markup - if-else-block", async () => {
        await testMarkupGeneration("if-else-block");
    });
    it("should generate correct markup - inline", async () => {
        await testMarkupGeneration("inline");
    });
    it("should generate correct markup - razor-in-razor", async () => {
        await testMarkupGeneration("razor-in-razor");
    });
    it("should generate correct markup - triangle-bracket-in-cs", async () => {
        await testMarkupGeneration("triangle-bracket-in-cs");
    });
    it("should generate correct markup - directives", async () => {
        await testMarkupGeneration("directives");
    });

    it("should be detected correctly", async () => {
        var code = await readFile(path.join(__dirname, 'detect', "cshtml-razor", "default.txt"), "utf-8");
        var actual = hljs.highlightAuto(code).language;
        actual.should.eql("cshtml-razor");
    });
});