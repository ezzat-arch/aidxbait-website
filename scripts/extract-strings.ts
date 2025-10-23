#!/usr/bin/env ts-node

/*
  Extract user-visible UI strings into STRINGS.json
  - Scans: app/**, components/**, contexts/**, hooks/**, lib/** (UI-facing only)
  - Captures: JSX text nodes, certain JSX attributes, common UI prop names, toast messages
  - Output: [{ key, en, ar: "" }], contextual dedupe per top-level area
*/

import { Project, SyntaxKind, Node, ts } from "ts-morph";
import { glob } from "glob";
import * as fs from "fs";
import * as path from "path";

type StringEntry = { key: string; en: string; ar: string };

const REPO_ROOT = path.resolve(__dirname, "..");
const TARGET_FILE = path.resolve(REPO_ROOT, "STRINGS.json");

const INCLUDE_DIRS = ["app", "components", "contexts", "hooks", "lib"];
const EXCLUDE_DIRS = ["app/api", "out", "docs", "database", "node_modules"];
const FILE_GLOBS = ["**/*.tsx", "**/*.ts", "**/*.jsx", "**/*.js"]; // priority handled in parsing

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

const REPORT: string[] = [];

function isExcluded(filePath: string): boolean {
	const norm = filePath.replace(/\\/g, "/");
	return EXCLUDE_DIRS.some(
		(ex) => norm.includes(`/${ex}/`) || norm.endsWith(`/${ex}`)
	);
}

function toKeyCase(input: string): string {
	return input
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, " ")
		.trim()
		.split(/\s+/)
		.slice(0, 5)
		.join("_");
}

function areaPrefixFromFile(relPath: string): string {
	const parts = relPath.replace(/\\/g, "/").split("/");
	// derive sensible top-level segments
	// e.g., components/sections/hero-section.tsx => sections.hero
	// e.g., app/services/store/page.tsx => services.store
	let base = parts.slice(0, 3); // up to 3 parts
	if (base[0] === "app") {
		base = base.slice(1); // drop 'app'
	}
	if (base[0] === "components") {
		base = base.slice(1); // drop 'components'
	}
	const fileName = path.basename(relPath).replace(/\.(tsx|ts|jsx|js)$/i, "");
	const dirParts = base.filter((p) => p && p !== "(auth)" && p !== "app");
	// If last segment looks like 'page' use its parent(s)
	const nameParts = dirParts.length > 0 ? dirParts : [fileName];
	return nameParts
		.map((s) => s.replace(/[^a-zA-Z0-9]+/g, " ").trim())
		.filter(Boolean)
		.slice(0, 3)
		.map((s) => s.split(" ")[0])
		.join(".");
}

function makeKey(relPath: string, role: string, text: string): string {
	const area = areaPrefixFromFile(relPath) || "misc";
	const slug = toKeyCase(text);
	return [area, role, slug].filter(Boolean).join(".");
}

function pushEntry(entries: Map<string, StringEntry>, key: string, en: string) {
	if (!en || !en.trim()) return;
	if (!entries.has(key)) {
		entries.set(key, { key, en, ar: "" });
	}
}

function isProbablyUserVisibleText(text: string): boolean {
	const t = text.trim();
	if (!t) return false;
	// ignore class-like values or purely punctuation
	if (/^[.#/{}$<>=_-]+$/.test(t)) return false;
	// ignore variable templates
	return true;
}

async function collectFiles(): Promise<string[]> {
	const patterns = INCLUDE_DIRS.map((dir) =>
		FILE_GLOBS.map((g) => `${dir}/${g}`)
	).flat();
	const files = await glob(patterns, {
		cwd: REPO_ROOT,
		nodir: true,
		dot: false,
	});
	const filtered = files
		.map((f) => path.resolve(REPO_ROOT, f))
		.filter((f) => !isExcluded(f));
	return filtered;
}

function collectFromSource(
	filePath: string,
	entries: Map<string, StringEntry>
) {
	const rel = path.relative(REPO_ROOT, filePath);
	const sourceFile = project.addSourceFileAtPath(filePath);

	// 1) JSX Text: <Tag>Text</Tag>
	sourceFile.forEachDescendant((node) => {
		// JSX text content
		if (Node.isJsxText(node)) {
			const raw = node.getText();
			const text = raw.replace(/\s+/g, " ").trim();
			if (isProbablyUserVisibleText(text)) {
				const key = makeKey(rel, "text", text);
				pushEntry(entries, key, text);
			}
			return;
		}

		// JSX attribute string literals
		if (Node.isJsxAttribute(node)) {
			const name = node.getName();
			if (!ATTR_NAMES.has(name)) return;
			const init = node.getInitializer();
			if (!init) return;
			if (
				Node.isStringLiteral(init) ||
				Node.isNoSubstitutionTemplateLiteral(init)
			) {
				const text = init.getLiteralText();
				if (isProbablyUserVisibleText(text)) {
					const key = makeKey(rel, `attr.${name}`, text);
					pushEntry(entries, key, text);
				}
			}
			return;
		}

		// Props on JSX opening element: propName="string"
		if (Node.isJsxOpeningElement(node) || Node.isJsxSelfClosingElement(node)) {
			const attrs = node.getAttributes();
			for (const attr of attrs) {
				if (Node.isJsxAttribute(attr)) {
					const propName = attr.getName();
					if (!UI_PROP_NAMES.has(propName)) continue;
					const init = attr.getInitializer();
					if (!init) continue;
					if (
						Node.isStringLiteral(init) ||
						Node.isNoSubstitutionTemplateLiteral(init)
					) {
						const text = init.getLiteralText();
						if (isProbablyUserVisibleText(text)) {
							const key = makeKey(rel, `prop.${propName}`, text);
							pushEntry(entries, key, text);
						}
					}
				}
			}
			return;
		}

		// Toasts: toast({ title: "...", description: "..." })
		if (Node.isCallExpression(node)) {
			const expr = node.getExpression();
			const name = Node.isIdentifier(expr) ? expr.getText() : "";
			if (name !== "toast") return;
			const args = node.getArguments();
			if (!args.length) return;
			const first = args[0];
			if (Node.isObjectLiteralExpression(first)) {
				for (const prop of first.getProperties()) {
					if (Node.isPropertyAssignment(prop)) {
						const propName = prop.getName();
						if (propName === "title" || propName === "description") {
							const init = prop.getInitializer();
							if (
								init &&
								(Node.isStringLiteral(init) ||
									Node.isNoSubstitutionTemplateLiteral(init))
							) {
								const text = init.getLiteralText();
								if (isProbablyUserVisibleText(text)) {
									const key = makeKey(rel, `toast.${propName}`, text);
									pushEntry(entries, key, text);
								}
							}
						}
					}
				}
			}
			return;
		}
	});

	// Additional: known data structures used directly in UI (simple heuristic)
	// Exported arrays of objects with label/name/description fields
	sourceFile.getVariableDeclarations().forEach((vd) => {
		const name = vd.getName();
		const init = vd.getInitializer();
		if (!init) return;
		if (Node.isArrayLiteralExpression(init)) {
			// scan object literals inside arrays for label/name/description
			init.getElements().forEach((el) => {
				if (Node.isObjectLiteralExpression(el)) {
					el.getProperties().forEach((p) => {
						if (Node.isPropertyAssignment(p)) {
							const propName = p.getName().replace(/['"]/g, "");
							if (
								["label", "name", "description", "caption"].includes(propName)
							) {
								const v = p.getInitializer();
								if (
									v &&
									(Node.isStringLiteral(v) ||
										Node.isNoSubstitutionTemplateLiteral(v))
								) {
									const text = v.getLiteralText();
									if (isProbablyUserVisibleText(text)) {
										const key = makeKey(rel, `data.${propName}`, text);
										pushEntry(entries, key, text);
									}
								}
							}
						}
					});
				}
			});
		}
	});
}

function contextualDedupe(
	entries: Map<string, StringEntry>
): Map<string, StringEntry> {
	// dedupe within same top-level area (before first dot)
	const seenByAreaText = new Map<string, string>(); // area+en -> key
	const result = new Map<string, StringEntry>();
	for (const [key, entry] of entries) {
		const area = key.split(".")[0] || "misc";
		const areaText = `${area}|${entry.en}`;
		if (seenByAreaText.has(areaText)) {
			// reuse earliest key; skip adding duplicate
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

function loadExisting(): Map<string, StringEntry> {
	try {
		const raw = fs.readFileSync(TARGET_FILE, "utf8");
		const json = JSON.parse(raw) as unknown;
		const map = new Map<string, StringEntry>();
		if (Array.isArray(json)) {
			for (const row of json) {
				if (
					row &&
					typeof row === "object" &&
					typeof (row as any).key === "string" &&
					typeof (row as any).en === "string"
				) {
					const k = (row as any).key as string;
					const en = (row as any).en as string;
					map.set(k, { key: k, en, ar: "" });
				}
			}
		}
		return map;
	} catch {
		return new Map<string, StringEntry>();
	}
}

function writeOutput(entries: Map<string, StringEntry>) {
	const arr = Array.from(entries.values()).sort((a, b) =>
		a.key.localeCompare(b.key)
	);
	const json = JSON.stringify(arr, null, 2) + "\n";
	fs.writeFileSync(TARGET_FILE, json, "utf8");
}

function writeReport() {
	const out = path.resolve(REPO_ROOT, "extract-strings.report.txt");
	fs.writeFileSync(out, REPORT.join("\n"), "utf8");
}

const project = new Project({
	tsConfigFilePath: path.resolve(REPO_ROOT, "tsconfig.json"),
	skipFileDependencyResolution: true,
	skipAddingFilesFromTsConfig: true,
});

async function main() {
	const files = await collectFiles();
	const newEntries = new Map<string, StringEntry>();
	for (const f of files) {
		try {
			collectFromSource(f, newEntries);
		} catch (e) {
			REPORT.push(
				`Failed parsing ${path.relative(REPO_ROOT, f)}: ${(e as Error).message}`
			);
		}
	}

	// contextual dedupe
	const deduped = contextualDedupe(newEntries);

	// merge with existing
	const existing = loadExisting();
	for (const [key, entry] of deduped) {
		if (!existing.has(key)) {
			existing.set(key, entry);
		}
	}

	writeOutput(existing);
	writeReport();

	console.log(
		`Extracted: ${newEntries.size}, after dedupe: ${deduped.size}, total: ${existing.size}`
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
