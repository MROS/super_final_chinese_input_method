import {
    GroupMethod,
    選字單元,
} from "./basic";

import { InputKernel } from "./input_kernel";

class HMMKernel implements InputKernel {

    determineSequence(input: Array<選字單元>, groupMethod: GroupMethod): Array<string> {
        return [];
    }
    getCandidate(input: Array<選字單元>, range: [number, number]): Array<string> {
        return [];
    }

}

export { HMMKernel }