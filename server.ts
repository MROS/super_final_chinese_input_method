import express from "express";
import * as path from "path";
import * as bodyParser from "body-parser";

import { 輸入單元, GroupMethod } from "./basic";
import { GroupingKernel } from "./grouping_kernel";

import { getDictionary, Dictionary } from "./pre_process"
import { HMMKernel, getSentences } from "./HMM"


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
	let query : { input_unit_seq: Array<輸入單元> } = req.body;
	console.log(query);
	let input_unit_seq = query.input_unit_seq;
	let grouped_seq = GroupingKernel.assignGroup(input_unit_seq);
	console.log(grouped_seq);

	const determined_seq = kernel.determineSequence(grouped_seq, GroupMethod.complete);

	res.json({
		determined_seq,
		grouped_seq
	});
});

console.log("伺服器初始化完成！");
app.listen(8080);
