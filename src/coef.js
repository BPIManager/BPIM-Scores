const fs = require('fs');

const avgs = [];
//
// bpim-generateの生成結果を利用
//

class CoefBuild {

  constructor(options){
    this.target = options.t || "sp11"
    return this
  }

  getDate(){
    const d = new Date()
    return String(d.getFullYear()) + String("0" + d.getMonth() + 1).slice(-2) + String(d.getDate())
  }

  getFile(fileName){
    return fs.readFileSync(`./input/${this.target}.json`, 'utf-8')
  }

  getCoef(fileName){
    return fs.readFileSync(`./coef/${this.target}.csv`, 'utf-8')
  }

  writeFile(output){
    const outDir = `./input/${this.target}.json`
    fs.writeFileSync(outDir,JSON.stringify(output))
    console.log("Successfully finished! - " + outDir)
    return true;
  }

  hex(input){
    let res = "";
    for (var i = 0; i < input.length;i++){
      res += input.charCodeAt(i).toString(16);
    }
    return res;
  }

  async exec(){
    let body = []
    try{
      const diff = (diff)=>diff === "3" ? "H" : diff === "4" ? "A" : "L";
      const data = JSON.parse(await this.getFile(this.target)).reduce((groups,item)=>{
        groups[item.title + "[" + diff(item.difficulty) + "]"] = item;
        return groups;
      },{});
      const res = (await this.getCoef(this.target)).split(/\n/).reduce((group,item)=>{
        const t = item.replace(/"/g,"").split(",");
        if(!group) group = [];
        let songName = t[0].replace(/_q_/g,"?").replace(/_c_/g,":").replace(/_d_/g,"\"").replace(/_a_/g,"*").replace(/_e_/g,"!").replace(/_qo_/g,"'").replace(/_y_/g,"\\").replace(/_s_/g,"/").replace(/ \[A\]/,"[A]");
        if(songName.indexOf("Rave*it") > -1){
          songName = "Rave*it!! Rave*it!! [A]";
        }
        group.push({
          "Song title":songName,
          "Coefficient":t[1]
        });
        return group;
      },[]);
      let result = [];
      for(let i = 0;i < res.length; ++i){
        const coef = res[i];
        const song = data[coef["Song title"]];

        const avg = avgs.find((_item)=>_item.title === coef["Song title"]);

        if(!song){
          console.log("Update Error:" + coef["Song title"]);
          continue;
        }
        if(avg){
          data[coef["Song title"]]["wr"] = avg["wr"];
          data[coef["Song title"]]["avg"] = avg["avg"];
        }

        if(!song){
          console.log("Update Error:" + coef["Song title"]);
          continue;
        }
        if(this.target === "sp12"){
          const c = coef["Coefficient"];
          data[coef["Song title"]]["coef"] = Math.round((c > 1.6 ? c * 0.8 : c < 0.88 ? c * 1.2 : c) * 100000) / 100000;
        }else{
          data[coef["Song title"]]["coef"] = -1;
        }
      }

      result = Object.keys(data).reduce((groups,item)=>{
        groups.push(data[item])
        return groups;
      },[]);

      return this.writeFile(result.sort((a,b)=>a.title.localeCompare(b.title, 'ja')))
    }catch(e){
      console.error(e)
      return false
    }
  }

}

module.exports = CoefBuild
