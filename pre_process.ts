import * as fs from "fs";
import { 注音表示類, 注音種類列舉, toneCharToEnum } from "./basic"

const 聲母集 = new Set<string>([
    "ㄅ", "ㄆ", "ㄇ", "ㄈ", "ㄉ",
    "ㄊ", "ㄋ", "ㄌ", "ㄍ", "ㄎ",
    "ㄏ", "ㄐ", "ㄑ", "ㄒ", "ㄓ",
    "ㄔ", "ㄕ", "ㄖ", "ㄗ", "ㄘ",
    "ㄙ"
]);

const 介音集 = new Set<string>([
    "ㄧ", "ㄨ", "ㄩ"
]);

const 韻母集 = new Set<string>([
    "ㄚ", "ㄛ", "ㄜ", "ㄝ", "ㄞ",
    "ㄟ", "ㄠ", "ㄡ", "ㄢ", "ㄣ",
    "ㄤ", "ㄥ", "ㄦ"
]);

const 聲調集 = new Set<string>([
    "ˊ", "ˇ", "ˋ", "˙"
]);

function 字串轉注音種類列舉(s: string): 注音種類列舉 {
    if (聲母集.has(s)) { return 注音種類列舉.聲母; }
    if (介音集.has(s)) { return 注音種類列舉.介音; }
    if (韻母集.has(s)) { return 注音種類列舉.韻母; }
    if (聲調集.has(s)) { return 注音種類列舉.聲調; }
    return null;
}

// TODO: 檢查不合法
function 字串轉注音表示類(s: string): 注音表示類 {
    let ret = new 注音表示類();
    for (let c of s) {
        switch (字串轉注音種類列舉(c)) {
            case 注音種類列舉.聲母: {
                ret.聲母 = c;
                break;
            }
            case 注音種類列舉.介音: {
                ret.介音 = c;
                break;
            }
            case 注音種類列舉.韻母: {
                ret.韻母 = c;
                break;
            }
            case 注音種類列舉.聲調: {
                ret.聲調 = toneCharToEnum(c);
                break;
            }
            default: {
                throw Error(`${c} 並非注音符號`)
            }
        }
    }
    return ret;
}

function isValidBopomofo(s: string): boolean {
    try {
        字串轉注音表示類(s);
        return true;
    } catch (error) {
        // console.error(error);
        return false;
    }
}

// 發現原字典檔中，輕聲的符號會寫在前面，其他聲調則寫在後面，故需要正規化
function normalizeBopomofo(s: string): string {
    return 字串轉注音表示類(s).toString();
}

class Dictionary {
    bopomofoToChar: Map<string, string[]>;
    constructor() {
        this.bopomofoToChar = new Map<string, string[]>();
    }
    getByCompleteBopomofo(bopomofo: string): string[] {
        let ret = this.bopomofoToChar.get(bopomofo);
        if (ret == undefined) { return []; }
        return ret;
    }
}

function getDictionary(): Dictionary {
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

// console.log(dict);