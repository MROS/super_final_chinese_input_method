enum 輸入單元種類 {
    注音表示,
    漢字
}

enum 聲調列舉 {
    一, 二, 三, 四, 輕
}

enum GroupMethod {
    fast, complete
}

class 注音表示類 {
    聲調?: 聲調列舉;
    聲母?: string;
    介音?: string;
    韻母?: string;
}

class 輸入單元 {
    種類: 輸入單元種類;
    值: 注音表示類 | string
}

interface InputKernel {
    determineSequence: (input: Array<輸入單元>, groupMethod: GroupMethod) => Array<string>;
    getCandidate: (input: Array<輸入單元>, range: [number, number]) => Array<string>;
}