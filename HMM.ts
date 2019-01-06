import * as fs from "fs";

import {
    GroupMethod,
    選字單元,
    選字單元種類,
    注音表示類,
} from "./basic";

import { Dictionary, getDictionary } from "./pre_process";

import { InputKernel } from "./input_kernel";
import { stringify } from "querystring";

// 抓取整個目錄底下的 txt 檔，並轉換爲 Array<string> ，其中的 string 全部爲字典中的漢字
function getSentences(dir: string, dictionary: Dictionary) {
    let files  = fs.readdirSync(dir).filter(f => f.split(".")[1] == "txt");
    let ret = [];
    
    // XXX: 先用少本書測試
    // files = files.slice(0, 1);
    
    for (let f of files) {
        console.log(`處理 ${f}`);
        const content = fs.readFileSync(dir + "/" + f).toString();
        let sentence = "";
        for (let c of content) {
            let isChinese = dictionary.containChar(c);
            if (isChinese) {
                sentence += c;
            } else if (!isChinese && sentence.length > 0) {
                ret.push(sentence);
                sentence = "";
            }
        }
        if (sentence.length > 0) {
            ret.push(sentence);
            sentence = "";
        }
    }
    // ret = ret.slice(0, 1);
    return ret;
}

// let ss = getSentences("downloader", getDictionary());

// let dict = getDictionary();
// console.log(dict.getByCompleteBopomofo("ㄑㄧㄤ"));

function incMap(c: string, m: Map<string, number>) {
    let n = m.get(c);
    if (n == undefined) {
        m.set(c, 1);
    } else {
        m.set(c, n + 1);
    }
}

function incMap2d(c1: string, c2: string, m: Map<string, Map<string, number>>) {
    let inner_m = m.get(c1);
    if (inner_m == undefined) {
        m.set(c1, new Map<string, number>());
        inner_m = m.get(c1);
    }
    let n = inner_m.get(c2);
    if (n == undefined) {
        inner_m.set(c2, 1);
    } else {
        inner_m.set(c2, n + 1);
    }
}

function getMap(c: string, m: Map<string, number>): number {
    let n = m.get(c);
    if (n == undefined) {
        return 0;
    }
    return n;
}

function get2dMap(c1: string, c2: string, m: Map<string, Map<string, number>>): number {
    let inner_m = m.get(c1);
    if (inner_m == undefined) {
        return 0;
    }
    let n = inner_m.get(c2);
    if (n == undefined) {
        return 0;
    }
    return n;
}

// 機率以及前一個字
class ProbPrev {
    prob: number;
    prev: string;
    constructor(prob: number, prev: string) {
        this.prob = prob;
        this.prev = prev;
    }
}

class HMMKernel implements InputKernel {
    // NOTE: 可改變資料結構來優化性能
    transMatrix: Map<string, Map<string, number>>;
    initMatrix: Map<string, number>;
    // 注音符號必須先序列化再送入 map 查詢
    emmitMatrix: Map<string, Map<string, number>>;

    dictionary: Dictionary;

    constructor(dictionary: Dictionary, sentences: Array<string>) {
        this.dictionary = dictionary;

        this.initMatrix = new Map<string, number>();
        this.transMatrix = new Map<string, Map<string, number>>();

        for (let s of sentences) {

            for (let c of s) {
                incMap(c, this.initMatrix);
            }

            for (let i = 1; i < s.length; i++) {
                let [prev, cur] = [ s[i - 1], s[i] ];
                incMap2d(prev, cur, this.transMatrix);
            }
        }


        let chars = Array.from(this.initMatrix.keys());
        let n = chars.length;
        console.log(chars);
        console.log(`訓練資料共包含 ${n} 不同漢字`);
    }

    determineSequence(input: Array<選字單元>, groupMethod: GroupMethod): Array<string> {
        if (input.length == 0) {
            return [];
        }

        let maxProb: Array<Map<string, ProbPrev>> = [];

        maxProb[0] = new Map<string, ProbPrev>();
        if (input[0].種類 == 選字單元種類.漢字) {

            maxProb[0].set(<string>input[0].值, new ProbPrev(1, null));

        } else if (input[0].種類 == 選字單元種類.注音表示) {

            let s = (<注音表示類>input[0].值).toString();
            let probableChars = this.dictionary.getByCompleteBopomofo(s);
            for(let c of probableChars) {
                maxProb[0].set(c, new ProbPrev(getMap(c, this.initMatrix), null));
            }

        }

        function getBest(m: Map<string, ProbPrev>): string {
            let max = -1;
            let ret;
            console.log(Array.from(m.keys()));
            for (let key of m.keys()) {
                let v = m.get(key);
                // console.log(`${key}: ${JSON.stringify(v)}`);
                if (v.prob > max) {
                    max = v.prob;
                    ret = key;
                }
            }
            return ret;
        }

        let getBestPrev = (prevM: Map<string, ProbPrev>, char: string): ProbPrev => {
            let max = -1;
            let bestPrev = null;
            for (let prevChar of prevM.keys()) {
                let transProb = get2dMap(prevChar, char, this.transMatrix);
                let prob = transProb * prevM.get(prevChar).prob;
                console.log(`count best prev. prev: ${prevChar}, cur: ${char}, prevProb: ${prevM.get(prevChar).prob}, trans prob: ${transProb}`);

                // TODO: 避免轉移矩陣爲零，加入 initMatrix 平滑化
                prob += 0.1 * getMap(char, this.initMatrix);
                
                if (prob > max) {
                    max = prob;
                    bestPrev = new ProbPrev(prob, prevChar);
                }
            }

            return bestPrev;
        }

        // viterbi 算法
        for (let i = 1; i < input.length; i += 1) {

            maxProb[i] = new Map<string, ProbPrev>();

            if (input[i].種類 == 選字單元種類.漢字) {

                let prev = getBest(maxProb[i - 1]);
                maxProb[i].set(<string>input[i].值, new ProbPrev(1, prev));

            } else if (input[0].種類 == 選字單元種類.注音表示) {

                let s = (<注音表示類>input[i].值).toString();
                let probableChars = this.dictionary.getByCompleteBopomofo(s);
                for (let c of probableChars) {
                    maxProb[i].set(c, getBestPrev(maxProb[i - 1], c));
                }

            }
        }
        console.log("維特比算法結束");

        console.log(`長度：${input.length}`);
        // 從最後一個拿 prev 回去
        let ret = [];
        let cur = getBest(maxProb[input.length - 1]);
        console.log(cur);
        ret.push(cur);
        for (let i = input.length - 1; i > 0; i--) {
           cur = maxProb[i].get(cur).prev; 
            console.log(cur);
           ret.push(cur);
        }

        return ret.reverse();
    }
    getCandidate(input: Array<選字單元>, range: [number, number]): Array<string> {
        return [];
    }

}

export { HMMKernel, getSentences }