const fs = require("fs");
const axios = require("axios");

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const BEST_HUNDRED = "http://www.haodoo.net/?M=hd&P=100";

async function find_point(url) {
	let response = await (axios.get(url));

	const { document } = (new JSDOM(response.data)).window;
	const selector = "html body table tbody tr td table.a14 tbody tr td table tbody tr td table tbody tr td table tbody tr td table tbody tr td input";

	let nodes = document.querySelectorAll(selector);
	let id = "";
	for (let i = 0; i < nodes.length; i++) {
		if (nodes[i].value == "下載 epub 檔") {
			let script = nodes[i].getAttribute("onClick")
			id = script.slice(14, script.length - 2);
		}
	}

	return `http://www.haodoo.net/?M=d&P=${id}.epub`;
}

async function download(book_name, path) {
	console.log(book_name, path);
	
	let url = `http://www.haodoo.net/${path}`;
	let point = await find_point(url);
	// console.log(point);


	let response = await (axios.get(point, {
		responseType: "arraybuffer"
	}));

	fs.writeFileSync(`${book_name}.epub`, response.data)
}

async function main() {
	let response = await (axios.get(BEST_HUNDRED));

	const { document } = (new JSDOM(response.data)).window;

	let as = document.querySelectorAll(".a03 a");

	let book_list = [];
	for (let i = 0; i < as.length; i++) {
		let text = as[i].textContent;
		let href = as[i].href;
		if (href.length > 0) {
			book_list.push(as[i]);
		}
	}
	book_list = book_list.slice(16, 125);

	// 只拿兩本來測
	// book_list = book_list.slice(0, 2);

	for (let book of book_list) {
		download(book.textContent, book.href);
	}
}

main();


