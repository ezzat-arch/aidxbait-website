#!/usr/bin/env node
"use strict";

/*
  Dependency-free extractor using TypeScript compiler API
*/

const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const REPO_ROOT = path.resolve(__dirname, "..");
const TARGET_FILE = path.resolve(REPO_ROOT, "STRINGS.json");

const INCLUDE_DIRS = ["app", "components", "contexts", "hooks", "lib"];
const EXCLUDE_DIRS = ["app/api", "out", "docs", "database", "node_modules"];
const FILE_EXTS = new Set([".tsx", ".ts", ".jsx", ".js"]);

const ATTR_NAMES = new Set([
	"alt",
	"title",
	"placeholder",
	"aria-label",
	"aria-description",
	"aria-roledescription",
	"label",
]);

const UI_PROP_NAMES = new Set([
	"heading",
	"subtitle",
	"description",
	"caption",
	"emptyText",
	"ctaText",
	"buttonText",
	"successMessage",
	"errorMessage",
	"helperText",
]);

/** @type {string[]} */
const REPORT = [];

function isExcluded(filePath) {
	const norm = filePath.replace(/\\/g, "/");
	return EXCLUDE_DIRS.some(
		(ex) => norm.includes(`/${ex}/`) || norm.endsWith(`/${ex}`)
	);
}

function toKeyCase(input) {
	return input
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, " ")
		.trim()
		.split(/\s+/)
		.slice(0, 5)
		.join("_");
}

function areaPrefixFromFile(relPath) {
	const parts = relPath.replace(/\\/g, "/").split("/");
	if (relPath === "app/page.tsx" || relPath.endsWith("/app/page.tsx"))
		return "home";
	let base = parts.slice(0, 3);
	if (base[0] === "app" || base[0] === "components") base = base.slice(1);
	const fileName = path.basename(relPath).replace(/\.(tsx|ts|jsx|js)$/i, "");
	const dirParts = base.filter((p) => p && p !== "(auth)" && p !== "app");
	const nameParts = dirParts.length > 0 ? dirParts : [fileName];
	return nameParts
		.map((s) => s.replace(/[^a-zA-Z0-9]+/g, " ").trim())
		.filter(Boolean)
		.slice(0, 3)
		.map((s) => s.split(" ")[0])
		.join(".");
}

function makeKey(relPath, role, text) {
	const area = areaPrefixFromFile(relPath) || "misc";
	const slug = toKeyCase(text);
	return [area, role, slug].filter(Boolean).join(".");
}

/**
 * @param {Map<string,{key:string,en:string,ar:string}>} map
 * @param {string} key
 * @param {string} en
 */
function pushEntry(map, key, en) {
	if (!en || !en.trim()) return;
	if (!map.has(key)) map.set(key, { key, en, ar: "" });
}

function isProbablyUserVisibleText(text) {
	const t = text.trim();
	if (!t) return false;
	if (/^[.#/{}$<>=_-]+$/.test(t)) return false;
	return true;
}

/**
 * @param {string} dir
 * @returns {string[]}
 */
function walk(dir) {
	/** @type {string[]} */
	const files = [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		if (entry.name.startsWith(".")) continue;
		const full = path.join(dir, entry.name);
		if (isExcluded(full)) continue;
		if (entry.isDirectory()) {
			files.push(...walk(full));
		} else if (entry.isFile()) {
			if (FILE_EXTS.has(path.extname(entry.name))) files.push(full);
		}
	}
	return files;
}

function collectFiles() {
	/** @type {string[]} */
	const all = [];
	for (const base of INCLUDE_DIRS) {
		const dir = path.resolve(REPO_ROOT, base);
		if (fs.existsSync(dir)) all.push(...walk(dir));
	}
	return all;
}

/**
 * @param {string} rel
 * @param {ts.SourceFile} sf
 * @param {Map<string,{key:string,en:string,ar:string}>} entries
 */
function collectFromSource(rel, sf, entries) {
	/** @param {ts.Node} node */
	function visit(node) {
		// JSX Text
		if (ts.isJsxText(node)) {
			const raw = node.getFullText();
			const text = raw.replace(/\s+/g, " ").trim();
			if (isProbablyUserVisibleText(text)) {
				const key = makeKey(rel, "text", text);
				pushEntry(entries, key, text);
			}
		}

		// JSX Attribute
		if (ts.isJsxAttribute(node)) {
			const name = node.name.getText();
			if (ATTR_NAMES.has(name)) {
				const init = node.initializer;
				if (init && ts.isStringLiteral(init)) {
					const text = init.text;
					if (isProbablyUserVisibleText(text)) {
						const key = makeKey(rel, `attr.${name}`, text);
						pushEntry(entries, key, text);
					}
				} else if (
					init &&
					ts.isJsxExpression(init) &&
					init.expression &&
					ts.isStringLiteral(init.expression)
				) {
					const text = init.expression.text;
					if (isProbablyUserVisibleText(text)) {
						const key = makeKey(rel, `attr.${name}`, text);
						pushEntry(entries, key, text);
					}
				}
			}
		}

		// JSX Opening / SelfClosing with UI prop names
		if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
			for (const attr of node.attributes.properties) {
				if (ts.isJsxAttribute(attr)) {
					const propName = attr.name.getText();
					if (!UI_PROP_NAMES.has(propName)) continue;
					const init = attr.initializer;
					if (init && ts.isStringLiteral(init)) {
						const text = init.text;
						if (isProbablyUserVisibleText(text)) {
							const key = makeKey(rel, `prop.${propName}`, text);
							pushEntry(entries, key, text);
						}
					} else if (
						init &&
						ts.isJsxExpression(init) &&
						init.expression &&
						ts.isStringLiteral(init.expression)
					) {
						const text = init.expression.text;
						if (isProbablyUserVisibleText(text)) {
							const key = makeKey(rel, `prop.${propName}`, text);
							pushEntry(entries, key, text);
						}
					}
				}
			}
		}

		// toast({ title, description })
		if (ts.isCallExpression(node)) {
			const expr = node.expression;
			const name = ts.isIdentifier(expr) ? expr.text : "";
			if (name === "toast" && node.arguments.length) {
				const first = node.arguments[0];
				if (ts.isObjectLiteralExpression(first)) {
					for (const prop of first.properties) {
						if (ts.isPropertyAssignment(prop)) {
							const propName = prop.name.getText().replace(/['"]/g, "");
							if (propName === "title" || propName === "description") {
								const init = prop.initializer;
								if (ts.isStringLiteral(init)) {
									const text = init.text;
									if (isProbablyUserVisibleText(text)) {
										const key = makeKey(rel, `toast.${propName}`, text);
										pushEntry(entries, key, text);
									}
								}
							}
						}
					}
				}
			}
		}

		// Arrays of objects with label/name/description/caption
		if (
			ts.isVariableDeclaration(node) &&
			node.initializer &&
			ts.isArrayLiteralExpression(node.initializer)
		) {
			for (const el of node.initializer.elements) {
				if (ts.isObjectLiteralExpression(el)) {
					for (const p of el.properties) {
						if (ts.isPropertyAssignment(p)) {
							const propName = p.name.getText().replace(/['"]/g, "");
							if (
								["label", "name", "description", "caption"].includes(propName)
							) {
								const v = p.initializer;
								if (ts.isStringLiteral(v)) {
									const text = v.text;
									if (isProbablyUserVisibleText(text)) {
										const key = makeKey(rel, `data.${propName}`, text);
										pushEntry(entries, key, text);
									}
								}
							}
						}
					}
				}
			}
		}

		ts.forEachChild(node, visit);
	}
	visit(sf);
}

function contextualDedupe(entries) {
	const seenByAreaText = new Map();
	const result = new Map();
	for (const [key, entry] of entries) {
		const area = key.split(".")[0] || "misc";
		const areaText = `${area}|${entry.en}`;
		if (seenByAreaText.has(areaText)) {
			REPORT.push(
				`Deduped within area '${area}': '${entry.en}' as ${seenByAreaText.get(
					areaText
				)}`
			);
			continue;
		}
		seenByAreaText.set(areaText, key);
		result.set(key, entry);
	}
	return result;
}

function loadExisting() {
	try {
		const raw = fs.readFileSync(TARGET_FILE, "utf8");
		const json = JSON.parse(raw);
		const map = new Map();
		if (Array.isArray(json)) {
			for (const row of json) {
				if (
					row &&
					typeof row === "object" &&
					typeof row.key === "string" &&
					typeof row.en === "string"
				) {
					map.set(row.key, { key: row.key, en: row.en, ar: "" });
				}
			}
		}
		return map;
	} catch {
		return new Map();
	}
}

function writeOutput(entries) {
	const arr = Array.from(entries.values()).sort((a, b) =>
		a.key.localeCompare(b.key)
	);
	fs.writeFileSync(TARGET_FILE, JSON.stringify(arr, null, 2) + "\n", "utf8");
}

function writeReport() {
	const out = path.resolve(REPO_ROOT, "extract-strings.report.txt");
	fs.writeFileSync(out, REPORT.join("\n"), "utf8");
}

function main() {
	const files = collectFiles();
	const entries = new Map();
	for (const f of files) {
		try {
			const rel = path.relative(REPO_ROOT, f).replace(/\\/g, "/");
			const sourceText = fs.readFileSync(f, "utf8");
			const ext = path.extname(rel).toLowerCase();
			let kind = ts.ScriptKind.TSX;
			if (ext === ".tsx") kind = ts.ScriptKind.TSX;
			else if (ext === ".ts") kind = ts.ScriptKind.TS;
			else if (ext === ".jsx") kind = ts.ScriptKind.JSX;
			else if (ext === ".js") kind = ts.ScriptKind.JS;
			const sf = ts.createSourceFile(
				rel,
				sourceText,
				ts.ScriptTarget.ES2020,
				true,
				kind
			);
			collectFromSource(rel, sf, entries);
		} catch (e) {
			REPORT.push(
				`Failed parsing ${path.relative(REPO_ROOT, f)}: ${e.message}`
			);
		}
	}

	const deduped = contextualDedupe(entries);
	const existing = loadExisting();
	for (const [key, entry] of deduped) {
		if (!existing.has(key)) existing.set(key, entry);
	}
	writeOutput(existing);
	writeReport();
	console.log(
		`Extracted: ${entries.size}, after dedupe: ${deduped.size}, total: ${existing.size}`
	);
}

main();
