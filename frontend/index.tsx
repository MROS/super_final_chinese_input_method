import * as React from "react";
import { Component } from "react";
import { render } from "react-dom";
import BOPOMOFO_TABLE from "./bopomofo_table";

class App extends Component<any, {txt_content: string}> {
    constructor(props: any) {
        super(props);
        this.state = {
            txt_content: "" as string,
        };
    }
    handleTxtChange(evt: React.FormEvent<HTMLTextAreaElement>) {
        let txt = evt.currentTarget.value;
        let bopomofo_txt = "";
        for(let i = 0; i < txt.length; i++) {
            if(txt[i] in BOPOMOFO_TABLE) {
                bopomofo_txt += BOPOMOFO_TABLE[txt[i]];
            } else {
                bopomofo_txt += txt[i];
            }
        }
        this.setState({ txt_content: bopomofo_txt });
    }
    render() {
        return (
            <div>
                <textarea placeholder="超級輸入法" style={{
                    width: 600,
                    height: 500
                }} onChange={this.handleTxtChange}>{this.state.txt_content}</textarea>
            </div>
        );
    }
}

render(<App />, document.getElementById("root"))