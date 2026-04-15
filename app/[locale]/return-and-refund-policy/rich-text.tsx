import type { ReactNode } from "react";

/** Renders strings with <b>...</b> and <em>...</em> segments (trusted legal copy only). */
export function RichText({ content }: { content: string }) {
	const out: ReactNode[] = [];
	let buf = "";
	let mode: "plain" | "b" | "em" = "plain";
	let i = 0;
	let key = 0;

	const flush = () => {
		if (!buf) return;
		if (mode === "plain") {
			out.push(buf);
		} else if (mode === "b") {
			out.push(
				<strong key={key++} className="text-foreground">
					{buf}
				</strong>,
			);
		} else {
			out.push(<em key={key++}>{buf}</em>);
		}
		buf = "";
	};

	while (i < content.length) {
		if (content.startsWith("<b>", i)) {
			flush();
			mode = "b";
			i += 3;
		} else if (content.startsWith("</b>", i)) {
			flush();
			mode = "plain";
			i += 4;
		} else if (content.startsWith("<em>", i)) {
			flush();
			mode = "em";
			i += 4;
		} else if (content.startsWith("</em>", i)) {
			flush();
			mode = "plain";
			i += 5;
		} else {
			buf += content[i];
			i += 1;
		}
	}
	flush();
	return <>{out}</>;
}
