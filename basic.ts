export enum 輸入單元種類 {
    注音, 漢字
}

export class 輸入單元 {
    種類: 輸入單元種類;
    值: string;
}

export enum 選字單元種類 {
    注音表示,
    漢字
}

export enum 聲調列舉 {
    一 = "",
    二 = "ˊ",
    三 = "ˇ",
    四 = "ˋ",
    輕 = "˙",
}

export enum GroupMethod {
    fast, complete
}

export class 注音表示類 {
    聲調: 聲調列舉 | null;
    聲母: string | null;
    介音: string | null;
    韻母: string | null;
    constructor() {
        this.聲調 = null;
        this.聲母 = null;
        this.介音 = null;
        this.韻母 = null;
    }
    toString(): string {
        function ignoreNull(s) {
            if (s == null) { return ""; }
            return s.toString()
        }
        return `${ignoreNull(this.聲母)}${ignoreNull(this.介音)}${ignoreNull(this.韻母)}${ignoreNull(this.聲調)}`;
    }
}

export class 選字單元 {
    種類: 選字單元種類;
    值: 注音表示類 | string
}

export enum 注音種類列舉 {
    聲母, 韻母, 介音, 聲調, 無
};

export function toneCharToEnum(char) {
    if(char == " ") {
        return 聲調列舉.一;
    } else if(char == "ˊ") {
        return 聲調列舉.二;
    } else if(char == "ˇ") {
        return 聲調列舉.三;
    } else if(char == "ˋ") {
        return 聲調列舉.四;
    } else if(char == "˙") {
        return 聲調列舉.輕;
    }
}

export const 聲母集 = new Set<string>([
    "ㄅ", "ㄆ", "ㄇ", "ㄈ", "ㄉ",
    "ㄊ", "ㄋ", "ㄌ", "ㄍ", "ㄎ",
    "ㄏ", "ㄐ", "ㄑ", "ㄒ", "ㄓ",
    "ㄔ", "ㄕ", "ㄖ", "ㄗ", "ㄘ",
    "ㄙ"
]);

export const 介音集 = new Set<string>([
    "ㄧ", "ㄨ", "ㄩ"
]);

export const 韻母集 = new Set<string>([
    "ㄚ", "ㄛ", "ㄜ", "ㄝ", "ㄞ",
    "ㄟ", "ㄠ", "ㄡ", "ㄢ", "ㄣ",
    "ㄤ", "ㄥ", "ㄦ"
]);

export const 聲調集 = new Set<string>([
    "ˊ", "ˇ", "ˋ", "˙", " "
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

export function isValidBopomofo(s: string): boolean {
    try {
        字串轉注音表示類(s);
        return true;
    } catch (error) {
        return false;
    }
}

// 發現原字典檔中，輕聲的符號會寫在前面，其他聲調則寫在後面，故需要正規化
export function normalizeBopomofo(s: string): string {
    return 字串轉注音表示類(s).toString();
}
