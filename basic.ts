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
