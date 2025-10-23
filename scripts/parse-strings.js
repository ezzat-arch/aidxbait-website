#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const INPUT_FILE = path.resolve(REPO_ROOT, "STRINGS.json");
const OUTPUT_FILE = path.resolve(REPO_ROOT, "STRINGS_PARSED.json");

function main() {
	// Read and parse STRINGS.json
	const data = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));

	// Escape single quotes in en and ar fields
	const escaped = data.map((obj) => ({
		...obj,
		en: obj.en.replace(/'/g, "\\'"),
		ar: obj.ar.replace(/'/g, "\\'"),
	}));

	// Convert to single-line JSON wrapped in single quotes
	const jsonString = JSON.stringify(escaped);
	const output = "'" + jsonString + "'";

	// Write to output file
	fs.writeFileSync(OUTPUT_FILE, output, "utf8");

	console.log(`Created STRINGS_PARSED.json (${output.length} chars)`);
}

main();
