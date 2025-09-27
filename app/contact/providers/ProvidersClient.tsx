"use client";

import { useSearchParams } from "next/navigation";

export default function ProvidersClient() {
	const sp = useSearchParams();
	const q = sp.get("q") ?? "";

	return (
		<main>
			<h1>Providers</h1>
			<p>Search: {q}</p>
		</main>
	);
}
