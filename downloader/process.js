var exec = require('child_process').exec;
var execSync = require('child_process').execSync;

let ls = execSync("ls").toString();

let filenames = ls.split("\n").filter(f => f.split(".")[1] == "epub");

for (let file of filenames) {
    let [book_name, extension] = file.split(".");
    let ret = execSync(`pandoc -o ${book_name}.txt ${file}`);
    if (ret.length != 0) {
        console.log(`轉換 ${file} 成功`);
        console.log(`錯誤訊息：${ret}`);
    } else {
        console.log(`轉換 ${file} 成功`);
    }
}


