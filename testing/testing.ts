import { HMMKernel } from "../HMM";
import fs from "fs";

const bopomofo_filename = process.argv[2];
const ans_filename = process.argv[3];

function predictAll(string_bopomofo) {
    for(let bofomofo_seq of string_bopomofo.split(",")) {

    }
}

fs.readFile(ans_filename, (err, data) => {
    let string_ans = data.toString();
    fs.readFile(bopomofo_filename, (err, data) => {
        let string_bopomofo = data.toString();
        let string_predict = predictAll(string_bopomofo);
    });

});

HMMKernel.determineSequence: (input: Array<選字單元>, groupMethod: GroupMethod) => Array<string>;