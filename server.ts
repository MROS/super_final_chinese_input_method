import express from "express";
import * as path from "path";
import * as bodyParser from "body-parser";

import { 輸入單元, 選字單元, 選字單元種類, GroupMethod } from "./basic";
import { GroupingKernel } from "./grouping_kernel";

import { getDictionary, Dictionary } from "./pre_process"
import { HMMKernel, getSentences } from "./HMM"

type NumberCharTable = { [pos: number]: string };

function getSelectedSequence(bopomofo_seq: Array<選字單元>, hand_chosen_table: NumberCharTable ): Array<選字單元> {
	return bopomofo_seq.map((bopomofo, i) => {
		if(i in hand_chosen_table) {
			let unit = new 選字單元();
			unit.種類 = 選字單元種類.漢字;
			unit.值 = hand_chosen_table[i];
			return unit;
		} else {
			return bopomofo;
		}
	});
}

const app = express();
app.use(bodyParser.json());

app.use(express.static("frontend/dist"));
app.get("/", function(req, res) {
	res.sendFile(path.resolve("frontend/dist/index.html"));
});

const dictionary = getDictionary();
const sentences = getSentences("./downloader", dictionary);
const kernel = new HMMKernel(dictionary, sentences);

app.post("/determine-sequence", async function(req, res) {
	let query : { input_unit_seq: Array<輸入單元>, hand_chosen_table: NumberCharTable } = req.body;
	let input_unit_seq = query.input_unit_seq;
	let grouped_seq = GroupingKernel.assignGroup(input_unit_seq);
	grouped_seq = getSelectedSequence(grouped_seq, query.hand_chosen_table);
	console.log(grouped_seq);
	const determined_seq = kernel.determineSequence(grouped_seq, GroupMethod.complete);

	res.json({
		determined_seq,
		grouped_seq
	});
});

app.post("/get-candidate", async function(req, res) {
	let query : { input_unit_seq: Array<輸入單元>, hand_chosen_table: NumberCharTable, pos: number } = req.body;
	let input_unit_seq = query.input_unit_seq;
	let grouped_seq = GroupingKernel.assignGroup(input_unit_seq);
	grouped_seq = getSelectedSequence(grouped_seq, query.hand_chosen_table);
	res.json({
		candidate: kernel.getCandidate(grouped_seq, query.pos)
	});
	
});

console.log("伺服器初始化完成！");
app.listen(8080);
