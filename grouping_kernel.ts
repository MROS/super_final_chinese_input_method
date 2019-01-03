import { 輸入單元種類, 聲調列舉, GroupMethod, 注音表示類, 輸入單元, 選字單元, 選字單元種類, 注音種類列舉, toneCharToEnum  } from "./basic"

const 聲母表 = "ㄍㄎㄫㄐㄑㄬㄉㄊㄋㄅㄆㄇㄈㄪㄗㄘㄙㄓㄔㄕㄏㄒㄌㄖ";
const 韻母表 = "ㄚㄛㄝㄟㄞㄠㄡㄢㄤㄣㄥㄦ";
const 介音表 = "ㄧㄨㄩ";
const 聲調表 = " ˊˇˋ˙ ";

export class GroupingKernel {
    static assignGroup(input_unit_list: Array<輸入單元>): Array<選字單元> {
        let select_unit_list: Array<選字單元> = [];

        let cur_select_unit = new 選字單元();
        cur_select_unit.種類 = 選字單元種類.注音表示;
        cur_select_unit.值 = new 注音表示類();

        let prev_type: 注音種類列舉 = 注音種類列舉.無;
        for(let input_unit of input_unit_list) {
            if(聲調表.search(input_unit.值) != -1) {
                cur_select_unit.值.聲調 = toneCharToEnum(input_unit.值);
                select_unit_list.push(cur_select_unit);
                prev_type = 注音種類列舉.聲調;

                cur_select_unit = new 選字單元();
                cur_select_unit.種類 = 選字單元種類.注音表示;
                cur_select_unit.值 = new 注音表示類();
            } else {
                if(介音表.search(input_unit.值) != -1) {
                    cur_select_unit.值.介音 = input_unit.值;
                } else if(韻母表.search(input_unit.值) != -1) {
                    cur_select_unit.值.韻母 = input_unit.值;
                } else {
                    cur_select_unit.值.聲母 = input_unit.值;
                }               
            }
        }
        return select_unit_list;
    };
}