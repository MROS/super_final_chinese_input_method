const express = require("express");
const path = require("path");
const app = express();

type test = number

app.use(express.static("frontend/dist"));
app.get("/", function(req, res) {
	res.sendFile(path.resolve("frontend/dist/index.html"));
});
app.listen(80);
