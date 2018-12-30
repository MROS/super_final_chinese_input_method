import * as React from "react";
import { Component } from "react";
import { render } from "react-dom";

import BOPOMOFO_TABLE from "./bopomofo_table";
import { 注音 } from "../basic"

type IndexState = {
    txt_content: string,
};

class App extends Component<any, IndexState> {
    private bopomofo_list: Array<注音> = [];

    constructor(props: any) {
        super(props);
        this.state = {
            txt_content: "",
        };
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }
    async handleKeyPress(evt: React.KeyboardEvent<HTMLTextAreaElement>) {
        if(evt.keyCode == 8) {
            console.log("backspace");
            this.bopomofo_list.slice(0, bopomofo_list.length-1);
        } else {
            let char = String.fromCharCode(evt.charCode);
            if(char in BOPOMOFO_TABLE) {
                let bopomofo = new 注音();
                bopomofo.值 = BOPOMOFO_TABLE[char];
                this.bopomofo_list.push(bopomofo);
            }
        }
        let txt_content = this.bopomofo_list.reduce((str, bopomofo) => str + bopomofo.值, "");
        this.setState({ txt_content });
        let resp = await fetch("/determine-sequence", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sequence: this.bopomofo_list
            })
        });
        let data: { determined_sequence: Array<注音> } = await resp.json();
        //this.bopomofo_list = data.determined_sequence;
        //txt_content = this.bopomofo_list.reduce((str, bopomofo) => str + bopomofo.值, "");
        //this.setState({ txt_content });
    }
    render() {
        return (
            <div>
                <textarea placeholder="超級輸入法" style={{
                    width: 600,
                    height: 500
                }} onKeyPress={this.handleKeyPress} value={this.state.txt_content}></textarea>
            </div>
        );
    }
}

render(<App />, document.getElementById("root"))