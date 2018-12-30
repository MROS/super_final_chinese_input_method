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
    一, 二, 三, 四, 輕
}

export enum GroupMethod {
    fast, complete
}

export class 注音表示類 {
    聲調?: 聲調列舉;
    聲母?: string;
    介音?: string;
    韻母?: string;
}

export class 選字單元 {
    種類: 選字單元種類;
    值: 注音表示類 | string
}
