import fs from "fs";
import { title } from "process";
import rl from "readline";

class Build {
  private target: "sp11" | "sp12" = "sp11";

  constructor(options: { target: "sp11" | "sp12" }) {
    this.target = options.target || "sp11";
    return this;
  }

  getFile(dir?: string) {
    return fs.readFileSync(dir ? dir : `../input/${this.target}.json`, "utf-8");
  }

  writeFile(output: any) {
    const outDir = `../input/${this.target}.json`;
    fs.writeFileSync(outDir, JSON.stringify(output));
    console.log("Successfully finished! - " + outDir);
    return true;
  }

  async exec() {
    let updated = [];
    let endFlag = false;
    try {
      let res = JSON.parse(await this.getFile());
      const makeWrs = (input: string, difficultyStr: string) => {
        return input.split("\r\n").reduce(
          (
            group: {
              index: number;
              title: string;
              titleWithDiff: string;
              difficulty: string;
              difficultyLevel: number;
              notes: number;
              wr: number;
            }[],
            item
          ) => {
            if (!group) group = [];
            const split = item.split(",");
            if (!isNaN(Number(split[3])) && Number(split[2]) > 10) {
              group.push({
                index: Number(split[0]),
                title: String(split[1]),
                titleWithDiff:
                  String(split[1]) +
                  `[${
                    difficultyStr === "another"
                      ? "A"
                      : difficultyStr === "hyper"
                      ? "H"
                      : "L"
                  }]`,
                difficulty: difficultyStr,
                difficultyLevel: Number(split[2]),
                notes: Number(split[3]),
                wr: Number(split[4]),
              });
            }
            return group;
          },
          []
        );
      };
      const wrA = makeWrs(await this.getFile("../wr/another.csv"), "another");
      const wrL = makeWrs(
        await this.getFile("../wr/leggendaria.csv"),
        "leggendaria"
      );
      const all = wrA.concat(wrL);
      const output: any[] = [];
      for (let i = 0; i < res.length; ++i) {
        const item = res[i];
        const titleWithDiff =
          item["title"] +
          `[${
            item["difficulty"] === "3"
              ? "H"
              : item["difficulty"] === "4"
              ? "A"
              : "L"
          }]`;
        const wrIndex = all.find(
          (item) => item.titleWithDiff === titleWithDiff
        );
        if (!wrIndex) {
          console.log("NOTFOUND", item);
        } else {
          if (wrIndex.wr > Number(item.wr)) {
            console.log(
              "MODIFIED!",
              titleWithDiff,
              "OLD:",
              item.wr,
              "NEW:",
              wrIndex.wr
            );
          }
          item.wr = wrIndex.wr > Number(item.wr) ? wrIndex.wr : item.wr;
        }
        output.push(item);
      }
      return this.writeFile(output);
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}

const x = async () => {
  await new Build({
    target: "sp11",
  }).exec();
};

x();
