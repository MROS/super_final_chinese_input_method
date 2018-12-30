import * as express from "express";
import * as path from "path";
import * as bodyParser from "body-parser";

import { 注音 } from "./basic";

const app = express();
app.use(bodyParser.json());

app.use(express.static("frontend/dist"));
app.get("/", function(req, res) {
	res.sendFile(path.resolve("frontend/dist/index.html"));
});

app.post("/determine-sequence", async function(req, res) {
	let query : { sequence: Array<注音> } = req.body;
	let seq = query.sequence;
	console.log(seq);
	res.json({
		determined_sequence: seq
	});
});

app.listen(80);