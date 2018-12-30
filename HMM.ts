import {
    輸入單元種類,
    聲調列舉,
    GroupMethod,
    注音表示類,
    輸入單元,
    InputKernel
} from "./input_kernel";

class HMMKernel implements InputKernel {

    determineSequence(input: Array<輸入單元>, groupMethod: GroupMethod): Array<string> {
        return [];
    }
    getCandidate(input: Array<輸入單元>, range: [number, number]): Array<string> {
        return [];
    }

}

export { HMMKernel }