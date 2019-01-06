import { GroupMethod, 選字單元 } from "./basic"

export interface InputKernel {
    determineSequence: (input: Array<選字單元>, groupMethod: GroupMethod) => Array<string>;
    getCandidate: (input: Array<選字單元>, n: number) => Array<string>;
}