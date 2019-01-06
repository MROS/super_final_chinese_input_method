import "babel-polyfill";
import * as React from "react";
import { Component } from "react";
import { render } from "react-dom";

import BOPOMOFO_TABLE from "./bopomofo_table";
import { 輸入單元, 輸入單元種類, 選字單元 } from "../basic"

type IndexState = {
    input_unit_list: Array<輸入單元>,
    txt_bopomofo_content: string,
    txt_final_content_list: Array<string>,
    txt_typing_content: Array<string>,
    grouped_seq: Array<選字單元>, // 全都是注音表示
    selecting_pos: number,
    candidates: Array<string>,
};

function changeCharInString(s: string, char: string, pos: number) {
    return s.slice(0, pos) + char + s.slice(pos+1, s.length);
}

class App extends Component<any, IndexState> {
    // 記錄被使用者手動選定的字
    private hand_chosen_table: { [pos: number]: string } = {};

    constructor(props: any) {
        super(props);
        this.state = {
            input_unit_list: [],
            txt_bopomofo_content: "",
            txt_final_content_list: [],
            txt_typing_content: [],
            grouped_seq: [],
            selecting_pos: -1
        };
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.selectChar = this.selectChar.bind(this);
    }
    async determineSeq(input_unit_list: Array<輸入單元>) {
        let resp = await fetch("/determine-sequence", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                input_unit_seq: input_unit_list,
                hand_chosen_table: this.hand_chosen_table,
            })
        });
        let data: { grouped_seq: Array<選字單元>, determined_seq: string } = await resp.json();
        this.setState({ txt_typing_content: data.determined_seq });
        this.setState({ grouped_seq: data.grouped_seq });
    }
    async handleKeyPress(evt: React.KeyboardEvent<HTMLTextAreaElement>) {
        let input_unit_list = [...this.state.input_unit_list];
        if(evt.keyCode == 8) {
            console.log("backspace");
        } else {
            let char = String.fromCharCode(evt.charCode);
            if(char in BOPOMOFO_TABLE) {
                let bopomofo = new 輸入單元();
                bopomofo.值 = BOPOMOFO_TABLE[char];
                bopomofo.種類 = 輸入單元種類.注音;
                input_unit_list.push(bopomofo);
            }
        }
        this.setState({ input_unit_list });
        this.determineSeq(input_unit_list);
    }
    async startSelectChar(pos: number) {
        if(pos == this.state.selecting_pos) {
            this.setState({ selecting_pos: -1, candidates: [] });
        }
        else {
            this.setState({ selecting_pos: pos, candidates: [] });
            // this.setState({ candidates: ["測", "試"] });
            let resp = await fetch("/get-candidate", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    input_unit_seq: this.state.input_unit_list,
                    hand_chosen_table: this.hand_chosen_table,
                    pos
                })
            });
            let data: { candidate: Array<string> } = await resp.json();
            this.setState({ candidates: data.candidate });
        }
    }
    selectChar(pos: number, idx: number) {
        this.hand_chosen_table[pos] = this.state.candidates[idx];
        this.setState({ selecting_pos: -1, candidates: [] });
        console.log(this.hand_chosen_table);
        this.determineSeq(this.state.input_unit_list);
    }
    render() {
        let txt_bopomofo_content = this.state.input_unit_list.reduce((str, bopomofo) => str + bopomofo.值, "");
        return (
            <div>
                <textarea placeholder="超級輸入法" style={{
                    width: 1000,
                    fontSize: 20
                }} onKeyPress={this.handleKeyPress} value={txt_bopomofo_content}></textarea>
                <div>
                    {
                        this.state.txt_final_content_list.map(ctx => {
                            return <div>{ctx}</div>;
                        })
                    }
                    <div>
                        {
                            this.state.txt_typing_content.map((ch, i) => {
                                return (
                                    <div key={i} style={{ display: "inline-block", position: "relative" }}>
                                        <span key={i} style={{ cursor: "pointer", marginTop: -1 }}
                                            onClick={this.startSelectChar.bind(this, i)}>{ch}</span>
                                        {
                                            (() => {
                                                if(i == this.state.selecting_pos && this.state.candidates.length) {
                                                    return <SelectBlock
                                                        onSelect={this.selectChar.bind(this, i)}
                                                        candidates={this.state.candidates}/>;
                                                }
                                            })()
                                        }
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        );
    }
}

type SelectBlockProps = {
    candidates: Array<string>,
    onSelect: number => void
}

class SelectBlock extends Component<SelectBlockProps, any> {
    render() {
        return (
            <div style={{ position: "absolute", fontSize: 20, top: 12, left: 0, padding: 10, , backgroundColor: "rgba(200, 255, 255, 0.9)" }}>
                {
                    this.props.candidates.map((ch, i) => {
                        return (
                            <div key={i} className="candidate-txt" onClick={() => this.props.onSelect(i)}>
                                1.{ch}
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}
render(<App />, document.getElementById("root"))