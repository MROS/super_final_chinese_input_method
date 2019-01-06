import { 聲母集, 韻母集, 介音集, 聲調集, 注音表示類, 輸入單元, 選字單元, 選字單元種類, 注音種類列舉, toneCharToEnum  } from "./basic"

export class GroupingKernel {
    static assignGroup(input_unit_list: Array<輸入單元>): Array<選字單元> {
        let select_unit_list: Array<選字單元> = [];

        let cur_select_unit = new 選字單元();
        cur_select_unit.種類 = 選字單元種類.注音表示;
        cur_select_unit.值 = new 注音表示類();

        let prev_type: 注音種類列舉 = 注音種類列舉.無;
        for(let input_unit of input_unit_list) {
            if(!input_unit) {
                continue;
            }
            if(聲調集.has(input_unit.值)) {
                cur_select_unit.值.聲調 = toneCharToEnum(input_unit.值);
                if(cur_select_unit.值.介音 || cur_select_unit.值.韻母 || cur_select_unit.值.聲母) {
                    select_unit_list.push(cur_select_unit);
                }
                prev_type = 注音種類列舉.聲調;

                cur_select_unit = new 選字單元();
                cur_select_unit.種類 = 選字單元種類.注音表示;
                cur_select_unit.值 = new 注音表示類();
            } else {
                if(介音集.has(input_unit.值)) {
                    cur_select_unit.值.介音 = input_unit.值;
                } else if(韻母集.has(input_unit.值)) {
                    cur_select_unit.值.韻母 = input_unit.值;
                } else if(聲母集.has(input_unit.值)) {
                    cur_select_unit.值.聲母 = input_unit.值;
                }
            }
        }
        return select_unit_list;
    };
}