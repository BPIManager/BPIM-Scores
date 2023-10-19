const fs = require("fs");
const rl = require("readline");

class Build {
  constructor(options) {
    this.target = options.t || "sp11";
    this.mode = options.m || 0;
    return this;
  }

  getFile() {
    return fs.readFileSync(`./input/${this.target}.json`, "utf-8");
  }

  writeFile(output) {
    const outDir = `./input/${this.target}.json`;
    fs.writeFileSync(outDir, JSON.stringify(output));
    console.log("Successfully finished! - " + outDir);
    return true;
  }

  readInput(text) {
    const readline = rl.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve, reject) => {
      readline.question(text, (answer) => {
        resolve(answer);
        readline.close();
      });
    });
  }

  async exec() {
    let updated = [];
    let endFlag = false;
    try {
      let res = JSON.parse(await this.getFile());
      const m = this.mode === 0 ? "wr" : "avg";
      for (let i = 0; i < res.length; ++i) {
        const item = res[i];
        const userInput = endFlag
          ? item[m]
          : await this.readInput(
              `☆${item.difficultyLevel} ${item.title} (${i + 1} of ${
                res.length
              }) mode:${m}\nCurrently:${item[m]}, New:`
            );
        updated.push(
          Object.assign(item, {
            [m]:
              userInput === "" || Number.isNaN(userInput) ? item.wr : userInput,
          })
        );
        if (userInput === "end") {
          endFlag = true;
          continue;
        }
      }
      return this.writeFile(updated);
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}

module.exports = Build;
