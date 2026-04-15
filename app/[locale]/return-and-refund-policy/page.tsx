import { setRequestLocale } from "next-intl/server";
import { RichText } from "./rich-text";
import { getReturnRefundCopy } from "./copy";

function LiRich({ children }: { children: string }) {
	return (
		<li className="text-muted-foreground leading-relaxed">
			<RichText content={children} />
		</li>
	);
}

function ContactValue({
	kind,
	links,
}: {
	kind: "email" | "phone" | "site";
	links: ReturnType<typeof getReturnRefundCopy>["links"];
}) {
	if (kind === "email") {
		return (
			<a
				href={`mailto:${links.mail}`}
				className="text-primary hover:underline"
			>
				{links.mail}
			</a>
		);
	}
	if (kind === "phone") {
		return (
			<a href={links.phoneHref} className="text-primary hover:underline">
				{links.phone}
			</a>
		);
	}
	return (
		<a href={links.site} className="text-primary hover:underline">
			{links.siteDisplay}
		</a>
	);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const c = getReturnRefundCopy(locale);
	return {
		title: c.meta.title,
		description: c.meta.description,
	};
}

export default async function ReturnAndRefundPolicyPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const c = getReturnRefundCopy(locale);
	const { links } = c;

	return (
		<div className="bg-background pt-56 pb-16">
			<div className="container mx-auto px-6 md:px-10 max-w-4xl">
				<h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
					{c.header.h1}
				</h1>
				<p className="text-sm text-muted-foreground mb-8">
					<strong className="text-foreground">{c.header.updatedLabel}</strong>{" "}
					{c.header.updatedValue}
				</p>

				<section className="mb-8 space-y-4 text-muted-foreground leading-relaxed">
					<p>{c.intro.p1}</p>
					<ol className="list-decimal pl-6 space-y-1">
						{c.intro.ordered.map((t, i) => (
							<li key={i}>{t}</li>
						))}
					</ol>
					<p>{c.intro.p2}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s1.h}</h2>
					<p className="text-muted-foreground leading-relaxed mb-3">{c.s1.intro}</p>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
						{c.s1.defs.map((d, i) => (
							<li key={i}>
								<strong className="text-foreground">{d.label}</strong>{" "}
								{"bodyAfterLink" in d ? (
									<>
										{d.body}{" "}
										<a
											href={links.site}
											className="text-primary hover:underline"
										>
											{links.siteDisplay}
										</a>{" "}
										{d.bodyAfterLink}
									</>
								) : (
									d.body
								)}
							</li>
						))}
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s2.h}</h2>
					<p className="text-muted-foreground leading-relaxed mb-3">{c.s2.intro}</p>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
						{c.s2.items.map((t, i) => (
							<li key={i}>{t}</li>
						))}
					</ul>
					<p className="text-muted-foreground leading-relaxed mt-3">{c.s2.footer}</p>
				</section>

				<section className="mb-10 border-t border-border pt-6">
					<h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
						{c.partA.h}
					</h2>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s3.h}</h2>
					<p className="text-muted-foreground leading-relaxed mb-3">{c.s3.p1}</p>
					<p className="text-muted-foreground leading-relaxed mb-3">{c.s3.p2}</p>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
						{c.s3.cats.map((row, i) => (
							<li key={i}>
								<strong className="text-foreground">{row.tag}</strong> {row.text}
							</li>
						))}
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s4.h}</h2>
					<p className="text-muted-foreground leading-relaxed mb-3">{c.s4.p1}</p>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed mb-3">
						{c.s4.p1Items.map((t, i) => (
							<LiRich key={i} children={t} />
						))}
					</ul>
					<p className="text-muted-foreground leading-relaxed mb-3">{c.s4.p2}</p>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed mb-3">
						{c.s4.p2Items.map((t, i) => (
							<li key={i}>{t}</li>
						))}
					</ul>
					<p className="text-muted-foreground leading-relaxed">{c.s4.p3}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s5.h}</h2>
					<p className="text-muted-foreground leading-relaxed mb-3">{c.s5.p1}</p>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed mb-3">
						{c.s5.ifList.map((t, i) => (
							<li key={i}>{t}</li>
						))}
					</ul>
					<p className="text-muted-foreground leading-relaxed mb-3">
						<RichText content={c.s5.p2} />
					</p>
					<p className="text-muted-foreground leading-relaxed mb-3">{c.s5.p3}</p>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed mb-3">
						{c.s5.p3Items.map((t, i) => (
							<LiRich key={i} children={t} />
						))}
					</ul>
					<p className="text-muted-foreground leading-relaxed mb-3">{c.s5.p4}</p>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed mb-3">
						{c.s5.p4Items.map((item, i) =>
							typeof item === "string" ? (
								<li key={i}>{item}</li>
							) : (
								<li key={i} className="text-muted-foreground leading-relaxed">
									{item.lead}
									<ul className="list-disc pl-6 mt-2 space-y-1">
										{item.nested.map((n, j) => (
											<li key={j}>{n}</li>
										))}
									</ul>
								</li>
							),
						)}
					</ul>
					<p className="text-muted-foreground leading-relaxed">{c.s5.p5}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s6.h}</h2>
					<p className="text-muted-foreground leading-relaxed mb-3">
						<RichText content={c.s6.p1} />
					</p>
					<p className="text-muted-foreground leading-relaxed mb-3">{c.s6.p2}</p>
					<ol className="list-decimal pl-6 space-y-2 text-muted-foreground leading-relaxed">
						{c.s6.numbered.map((item, i) =>
							typeof item === "string" ? (
								<li key={i}>{item}</li>
							) : (
								<li key={i}>
									{item.lead}
									<ul className="list-disc pl-6 mt-2 space-y-1">
										{item.nested.map((n, j) => (
											<li key={j}>{n}</li>
										))}
									</ul>
								</li>
							),
						)}
					</ol>
					<p className="text-muted-foreground leading-relaxed mt-3">
						<RichText content={c.s6.labelNote} />
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s7.h}</h2>
					<p className="text-muted-foreground leading-relaxed mb-3">{c.s7.p1}</p>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed mb-3">
						{c.s7.items1.map((t, i) => (
							<li key={i}>{t}</li>
						))}
					</ul>
					<p className="text-muted-foreground leading-relaxed mb-3">{c.s7.p2}</p>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
						{c.s7.items2.map((t, i) => (
							<li key={i}>{t}</li>
						))}
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s8.h}</h2>
					<p className="text-muted-foreground leading-relaxed mb-3">{c.s8.intro}</p>
					<ol className="list-decimal pl-6 space-y-3 text-muted-foreground leading-relaxed">
						{c.s8.steps.map((step, i) => (
							<li key={i} className="text-muted-foreground leading-relaxed">
								{"contacts" in step ? (
									<>
										{step.lead}
										<ul className="list-disc pl-6 mt-2 space-y-1">
											{step.contacts.map((row, j) => (
												<li key={j}>
													<strong>{row.label}</strong>{" "}
													<ContactValue kind={row.kind} links={links} />
												</li>
											))}
										</ul>
									</>
								) : (
									<>
										{step.lead}
										<ul className="list-disc pl-6 mt-2 space-y-1">
											{step.bullets.map((b, j) => (
												<li key={j}>{b}</li>
											))}
										</ul>
									</>
								)}
							</li>
						))}
					</ol>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s9.h}</h2>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
						{c.s9.items.map((t, i) => (
							<LiRich key={i} children={t} />
						))}
					</ul>
					<p className="text-muted-foreground leading-relaxed mt-3">{c.s9.footer}</p>
				</section>

				<section className="mb-10 border-t border-border pt-6">
					<h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
						{c.partB.h}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{c.partB.p}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s10.h}</h2>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
						{c.s10.items.map((t, i) => (
							<LiRich key={i} children={t} />
						))}
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s11.h}</h2>
					<h3 className="text-xl font-semibold text-foreground mt-4 mb-2">
						{c.s11.s111h}
					</h3>
					<p className="text-muted-foreground leading-relaxed">{c.s11.s111p}</p>
					<h3 className="text-xl font-semibold text-foreground mt-4 mb-2">
						{c.s11.s112h}
					</h3>
					<p className="text-muted-foreground leading-relaxed mb-3">{c.s11.s112p}</p>
					<ul className="list-disc pl-6 space-y-3 text-muted-foreground leading-relaxed">
						{c.s11.s112Tiers.map((tier, i) => (
							<li key={i}>
								<strong className="text-foreground">{tier.title}</strong>
								<ul className="list-disc pl-6 mt-2 space-y-1">
									{tier.items.map((t, j) => (
										<LiRich key={j} children={t} />
									))}
								</ul>
							</li>
						))}
					</ul>
					<h3 className="text-xl font-semibold text-foreground mt-4 mb-2">
						{c.s11.s113h}
					</h3>
					<p className="text-muted-foreground leading-relaxed">{c.s11.s113p}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s12.h}</h2>
					<p className="text-muted-foreground leading-relaxed mb-3">{c.s12.p1}</p>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
						{c.s12.items.map((block, i) => (
							<li key={i}>
								{block.lead}
								<ul className="list-disc pl-6 mt-2 space-y-1">
									{block.nested.map((n, j) => (
										<LiRich key={j} children={n} />
									))}
								</ul>
							</li>
						))}
					</ul>
					<p className="text-muted-foreground leading-relaxed mt-3">{c.s12.footer}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s13.h}</h2>
					<h3 className="text-xl font-semibold text-foreground mt-4 mb-2">
						{c.s13.s131h}
					</h3>
					<p className="text-muted-foreground leading-relaxed mb-3">
						<RichText content={c.s13.s131p} />
					</p>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
						{c.s13.s131items.map((t, i) => (
							<li key={i}>{t}</li>
						))}
					</ul>
					<h3 className="text-xl font-semibold text-foreground mt-4 mb-2">
						{c.s13.s132h}
					</h3>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
						{c.s13.s132items.map((t, i) => (
							<LiRich key={i} children={t} />
						))}
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s14.h}</h2>
					<p className="text-muted-foreground leading-relaxed mb-3">{c.s14.p1}</p>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
						{c.s14.items.map((t, i) => (
							<LiRich key={i} children={t} />
						))}
					</ul>
				</section>

				<section className="mb-10 border-t border-border pt-6">
					<h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
						{c.partC.h}
					</h2>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s15.h}</h2>
					<p className="text-muted-foreground leading-relaxed mb-3">
						<RichText content={c.s15.p1} />
					</p>
					<p className="text-muted-foreground leading-relaxed">{c.s15.p2}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s16.h}</h2>
					<p className="text-muted-foreground leading-relaxed mb-3">{c.s16.p1}</p>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
						{c.s16.items.map((block, i) => (
							<li key={i}>
								{block.lead}
								<ul className="list-disc pl-6 mt-2 space-y-1">
									{block.nested.map((n, j) => (
										<li key={j}>{n}</li>
									))}
								</ul>
							</li>
						))}
					</ul>
					<p className="text-muted-foreground leading-relaxed mt-3">{c.s16.footer}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s17.h}</h2>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
						{c.s17.items.map((t, i) => (
							<LiRich key={i} children={t} />
						))}
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">{c.s18.h}</h2>
					<p className="text-muted-foreground leading-relaxed mb-3">{c.s18.p1}</p>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
						{c.s18.lines.map((row, i) => (
							<li key={i}>
								<strong className="text-foreground">{row.label}</strong>{" "}
								{row.kind === "text" ? (
									row.value
								) : (
									<ContactValue kind={row.kind} links={links} />
								)}
							</li>
						))}
					</ul>
				</section>
			</div>
		</div>
	);
}
