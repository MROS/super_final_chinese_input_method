import * as fs from "fs";

import {
    GroupMethod,
    選字單元,
    選字單元種類,
    注音表示類,
} from "./basic";

import { Dictionary, getDictionary } from "./pre_process";

import { InputKernel } from "./input_kernel";

// 抓取整個目錄底下的 txt 檔，並轉換爲 Array<string> ，其中的 string 全部爲字典中的漢字
function getSentences(dir: string, dictionary: Dictionary) {
    const files  = fs.readdirSync(dir).filter(f => f.split(".")[1] == "txt");
    const ret = [];
    
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
    return ret;
}

// let ss = getSentences("downloader", getDictionary());

class HMMKernel implements InputKernel {
    // NOTE: 可改變資料結構來優化性能
    transMatrix: Map<string, Map<string, number>>;
    initMatrix: Map<string, number>;
    // 注音符號必須先序列化再送入 map 查詢
    emmitMatrix: Map<string, Map<string, number>>;

    dictionary: Dictionary;

    constructor(dictionary: Dictionary, sentences: Array<string>) {
        this.dictionary = dictionary;

        for (let sentence of sentences) {
            if (sentence.length == 0) { continue; } 

            for (let i = 1; i < sentence.length; i++) {
                
            }
        }
    }

    determineSequence(input: Array<選字單元>, groupMethod: GroupMethod): Array<string> {
        if (input.length == 0) {
            return [];
        }

        let maxProb: Array<Map<string, number>> = [];

        maxProb[0] = new Map<string, number>();
        if (input[0].種類 == 選字單元種類.漢字) {
            maxProb[0].set(<string>input[0].值, 1);
        } else if (input[0].種類 == 選字單元種類.注音表示) {
            let s = (<注音表示類>input[0].值).toString();
            let probableChars = this.dictionary.getByCompleteBopomofo(s);
            for(let c of probableChars) {
                maxProb[0].set(c, this.initMatrix[c]);
            }
        }

        // viterbi 算法
        for (let i = 1; i < input.length; i += 1) {
            maxProb[i] = new Map<string, number>();
            if (input[i].種類 == 選字單元種類.漢字) {
                maxProb[i].set(<string>input[i].值, 1);
            } else if (input[0].種類 == 選字單元種類.注音表示) {
                let s = (<注音表示類>input[i].值).toString();
                let probableChars = this.dictionary.getByCompleteBopomofo(s);
                for (let c of probableChars) {
                    for (let prevChar of maxProb[i - 1]) {
                        // TODO
                    }
                }
            }
        }

        return [];
    }
    getCandidate(input: Array<選字單元>, range: [number, number]): Array<string> {
        return [];
    }

}

export { HMMKernel }