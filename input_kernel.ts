import { 輸入單元種類, 聲調列舉, GroupMethod, 注音表示類, 輸入單元 } from "./basic"

export interface InputKernel {
    determineSequence: (input: Array<輸入單元>, groupMethod: GroupMethod) => Array<string>;
    getCandidate: (input: Array<輸入單元>, range: [number, number]) => Array<string>;
}