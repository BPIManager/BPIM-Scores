const oldURL = "https://raw.githubusercontent.com/potakusan/bpim-score-repo/master/input/sp12.json";
const newURL = "https://files.poyashi.me/bpim/releases/20210508/sp12.json";

var get = async (input) => {
  const f = await fetch(input);
  return await f.json();
};

var diffName = (diff) => {
  if (diff === "3") return "(H)";
  if (diff === "4") return "(A)";
  return "(L)";
};

var makeObj = (arr) => {
  return arr.reduce((group, item) => {
    if (!group) {
      group = new Object();
    }
    const key = item.title + diffName(item.difficulty);
    group[key] = item.avg;
    return group;
  }, {});
};

const main = async () => {
  const oldDef = await get(oldURL);
  const oldObj = makeObj(oldDef);
  let result = {};
  (await get(newURL)).map((item) => {
    const key = item.title + diffName(item.difficulty);

    const oldAvg = Number(oldObj[key]) || -1;
    const newAvg = Number(item["avg"]) || -1;
    if (oldAvg !== -1 && newAvg !== -1) {
      result[key] = {
        old: oldAvg,
        new: newAvg,
        per: (newAvg / oldAvg) * 100 - 100,
      };
    }
  });

  //CSV
  let res = "";
  Object.keys(result).map((item) => {
    const obj = result[item];
    res += `${item},${obj.old},${obj.new},${obj.per}\n`;
  });
  console.log(res);
};

main();
