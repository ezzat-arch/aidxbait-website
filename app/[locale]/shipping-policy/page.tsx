import { setRequestLocale } from "next-intl/server";
import { RichText } from "../return-and-refund-policy/rich-text";
import { getShippingPolicyCopy } from "./copy";

function LiRich({ text }: { text: string }) {
	return (
		<li className="text-muted-foreground leading-relaxed">
			<RichText content={text} />
		</li>
	);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const c = getShippingPolicyCopy(locale);
	return {
		title: c.meta.title,
		description: c.meta.description,
	};
}

export default async function ShippingPolicyPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const c = getShippingPolicyCopy(locale);

	return (
		<div className="bg-background pt-56 pb-16">
			<div className="container mx-auto px-6 md:px-10 max-w-4xl">
				<h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">
					{c.header.h1}
				</h1>

				<p className="text-muted-foreground leading-relaxed mb-8">{c.intro}</p>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s1.h}</h2>
					<p className="text-muted-foreground leading-relaxed mb-3">
						<RichText content={c.s1.p} />
					</p>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
						{c.s1.items.map((t, i) => (
							<LiRich key={i} text={t} />
						))}
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s2.h}</h2>
					<div className="overflow-x-auto rounded-lg border border-border">
						<table className="w-full text-sm">
							<thead className="bg-muted">
								<tr>
									<th className="px-4 py-3 text-left font-semibold text-foreground">
										{c.s2.table.region}
									</th>
									<th className="px-4 py-3 text-left font-semibold text-foreground">
										{c.s2.table.eta}
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{c.s2.table.rows.map((row, i) => (
									<tr key={i}>
										<td className="px-4 py-3 text-foreground">{row.region}</td>
										<td className="px-4 py-3 text-muted-foreground">{row.eta}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s3.h}</h2>
					<p className="text-muted-foreground leading-relaxed">{c.s3.p}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s4.h}</h2>
					<p className="text-muted-foreground leading-relaxed">{c.s4.p}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s5.h}</h2>
					<p className="text-muted-foreground leading-relaxed">
						<RichText content={c.s5.p} />
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s6.h}</h2>
					<p className="text-muted-foreground leading-relaxed">{c.s6.p}</p>
				</section>
			</div>
		</div>
	);
}
