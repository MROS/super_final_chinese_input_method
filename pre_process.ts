import * as fs from "fs";
import {
    isValidBopomofo,
    normalizeBopomofo
} from "./basic"

// TODO: 以 trie 樹實作 getBypartialBopomofo
export class Dictionary {
    bopomofoToChar: Map<string, string[]>;
    charSet: Set<string>;
    constructor() {
        this.bopomofoToChar = new Map<string, string[]>();
        this.charSet = new Set<string>();
    }
    containChar(c: string): boolean {
        return this.charSet.has(c);
    }
    getByCompleteBopomofo(bopomofo: string): string[] {
        let ret = this.bopomofoToChar.get(bopomofo);
        if (ret == undefined) { return []; }
        return ret;
    }
}

export function getDictionary(): Dictionary {
    let dictFile = fs.readFileSync("./data/dict-revised.unicode.json").toString();
    let dictJSON = JSON.parse(dictFile);
    // 過濾長度以得到「字典」而非原來的「詞典」

    function OnlyBopomofo(definition): {char: string, bopomofo: string[]} {
        let bopomofo = definition.heteronyms.filter(h => h.bopomofo != undefined).map(h => h.bopomofo);
        let s = "";
        s.startsWith
        // 去除掉
        bopomofo = bopomofo.map((b) => {
            if (b.startsWith("（又音）") || b.startsWith("（讀音）") || b.startsWith("（語音）")) {
                return b.slice(4);
            } else {
                return b;
            }
        });
        return {
            char: definition.title,
            bopomofo: bopomofo
        };
    } 

    let tmpDict: { char: string, bopomofo: string[] }[] = dictJSON.filter(w => w.title.length == 1).map(OnlyBopomofo);

    // 將沒有注音的剔除
    tmpDict = tmpDict.filter(w => w.bopomofo.length != 0);

    let dictionary = new Dictionary();

    for(let w of tmpDict) {
        dictionary.charSet.add(w.char);
        for(let b of w.bopomofo) {
            if(isValidBopomofo(b)) {
                let nb = normalizeBopomofo(b);
                // let nb = b;
                let chars = dictionary.bopomofoToChar.get(nb);
                if (chars == undefined) {
                    dictionary.bopomofoToChar.set(nb, [w.char]);
                } else {
                    chars.push(w.char);
                }
            } else {
                console.log(b);
            }
        }
    }

    return dictionary;
}

// let dict = getDictionary();

// console.log(dict.charSet.size);