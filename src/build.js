const fs = require("fs");

class Build {
  constructor(options) {
    this.outputName = options.n;
    this.outputVersion = options.o || this.getDate();
    this.requireVersion = options.r || "1";
    return this;
  }

  getDate() {
    const d = new Date();
    return (
      String(d.getFullYear()) +
      String("0" + d.getMonth() + 1).slice(-2) +
      String(d.getDate())
    );
  }

  getFile(fileName) {
    return fs
      .readFileSync(`./input/${fileName}.json`, "utf-8")
      .replace(/^\uFEFF/, "");
  }

  writeFile(output) {
    const outDir = `./output/${this.outputName}`;
    fs.writeFileSync(outDir, JSON.stringify(output));
    console.log("Successfully finished! - " + outDir);
    return true;
  }

  async exec() {
    const inputs = ["sp11", "sp12", "dp11", "dp12"];
    let body = [];
    try {
      for (let i = 0; i < inputs.length; ++i) {
        const res = this.getFile(inputs[i]);
        console.log(res);
        JSON.parse(res).map((item) => {
          body.push(item);
        });
      }
      return this.writeFile({
        version: this.outputVersion,
        requireVersion: String(this.requireVersion),
        body: body,
      });
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}

module.exports = Build;
