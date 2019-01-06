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

function predictAll(string_bopomofo) {
    let array_predict = [];
    console.log(JSON.stringify(string_bopomofo.slice(0, 20)))
    for(let bopomofo_seq of string_bopomofo.split(/, */)) {
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
        array_predict.push(kernel.determineSequence(group_list, GroupMethod.complete));
    }
    return array_predict;
}

fs.readFile(ans_filename, (err, data) => {
    let string_ans = data.toString();
    fs.readFile(bopomofo_filename, (err, data) => {
        let string_bopomofo = data.toString();
        let array_predict = predictAll(string_bopomofo);
    });

});
