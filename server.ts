import * as express from "express";
import * as path from "path";
import * as bodyParser from "body-parser";

import { 輸入單元 } from "./basic";
import { GroupingKernel } from "./grouping_kernel"

const app = express();
app.use(bodyParser.json());

app.use(express.static("frontend/dist"));
app.get("/", function(req, res) {
	res.sendFile(path.resolve("frontend/dist/index.html"));
});

app.post("/determine-sequence", async function(req, res) {
	let query : { input_unit_seq: Array<輸入單元> } = req.body;
	let input_unit_seq = query.input_unit_seq;
	let grouped_seq = GroupingKernel.assignGroup(input_unit_seq);
	console.log(grouped_seq);
	res.json({
		determined_seq: "測試",
		grouped_seq
	});
});

app.listen(80);