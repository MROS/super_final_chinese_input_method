import fs from "fs";

import { HMMKernel, getSentences } from "../HMM"
import { getDictionary, Dictionary } from "../pre_process"
import { 注音表示類, 選字單元, 輸入單元, 輸入單元種類, GroupMethod } from "../basic";
import { GroupingKernel } from "../grouping_kernel";

const bopomofo_filename = process.argv[2];
const ans_filename = process.argv[3];

const dictionary = getDictionary();
const sentences = getSentences("./downloader", dictionary);
const kernel = new HMMKernel(dictionary, sentences);

function predictAll(array_bopomofo) {
    let array_predict = [];
    for(let bopomofo_seq of array_bopomofo) {
        let input_unit_list = bopomofo_seq.split("").map(bopomofo => {
            if(bopomofo.length != 1) {
                return null;
            }
            let unit = new 輸入單元();
            unit.種類 = 輸入單元種類.注音;
            unit.值 = bopomofo;
            return unit;
        });
        let group_list = GroupingKernel.assignGroup(input_unit_list);
        let s = null;
        try {
            s = kernel.determineSequence(group_list, GroupMethod.complete).join("")
        } catch(err) { }
        array_predict.push(s);
    }
    return array_predict;
}

fs.readFile(ans_filename, (err, data) => {
    let array_ans = data.toString().split(/, */);
    fs.readFile(bopomofo_filename, (err, data) => {
        let array_bopomofo = data.toString().split(/, */);

        const DATA_OFFSET = 0;
        const DATA_N = 100;
        array_ans = array_ans.slice(DATA_OFFSET, DATA_OFFSET + DATA_N);
        array_bopomofo = array_bopomofo.slice(0, DATA_OFFSET + DATA_N);

        let array_predict = predictAll(array_bopomofo);
        let seq_count = array_ans.length;
        let miss = Array(seq_count).fill(0);
        let len = Array(seq_count).fill(0);
        let miss_rate = Array(seq_count).fill(0);
        for(let i = 0; i < array_ans.length; i++) {
            len[i] = array_ans[i].length;
            if(!array_predict[i]) { // 這句把input kernel搞壞了，跳過它
                console.log("broken");
                continue;
            }
            for(let j = 0; j < len[i]; j++) {
                if(array_predict[i][j] != array_ans[i][j]) {
                    miss[i]++;
                }
            }
            miss_rate[i] = miss[i] / len[i];
        }

        const sum = a => a.reduce((x, y) => x+y, 0);

        console.log(`共有${DATA_N}句，平均長度為${sum(len) / DATA_N}`)
        console.log(`每句的平均錯誤率為${sum(miss_rate) / DATA_N}`);
        console.log(`總錯誤率為${sum(miss) / sum(len)}`);
    });
});
