import {
	getTranslations,
	setRequestLocale,
} from "next-intl/server";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const t = await getTranslations({
		locale,
		namespace: "legal.terms_and_conditions",
	});

	return {
		title: t("meta_title"),
		description: t("meta_description"),
	};
}

export default async function TermsAndConditionsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("legal.terms_and_conditions");

	return (
		<div className="bg-background pt-56 pb-16">
			<div className="container mx-auto px-6 md:px-10 max-w-4xl">
				<h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
					{t("title")}
				</h1>
				<p className="text-sm text-muted-foreground mb-2">{t("subtitle")}</p>
				<p className="text-sm text-muted-foreground mb-8">
					<strong className="text-foreground">{t("effective_date_label")}:</strong>{" "}
					{t("effective_date_value")}
				</p>

				<section className="mb-8 space-y-4 text-muted-foreground leading-relaxed">
					<p>
						<strong className="text-foreground">{t("intro_company_label")}</strong>{" "}
						{t("intro_company_text")}
					</p>
					<div>
						<strong className="text-foreground">{t("intro_contact_label")}</strong>
						<ul className="list-disc ps-6 mt-2 space-y-1">
							<li>
								<strong>{t("intro_contact_email_label")}</strong>{" "}
								<a
									href={`mailto:${t("support_email")}`}
									className="text-primary hover:underline"
								>
									{t("support_email")}
								</a>
							</li>
							<li>
								<strong>{t("intro_contact_phone_label")}</strong>{" "}
								{t("intro_contact_phone_placeholder")}
							</li>
							<li>
								<strong>{t("intro_contact_address_label")}</strong>{" "}
								{t("intro_contact_address_text")}
							</li>
						</ul>
					</div>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s01_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{t("s01_body")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s02_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{t("s02_body")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s03_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{t("s03_body")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s04_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed mb-3">{t("s04_p1")}</p>
					<p className="text-muted-foreground leading-relaxed">{t("s04_p2")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s05_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{t("s05_body")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s06_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{t("s06_body")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s07_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{t("s07_body")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s08_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed mb-3">{t("s08_p1")}</p>
					<ul className="list-disc ps-6 space-y-2 text-muted-foreground leading-relaxed">
						<li>{t("s08_li_egypt")}</li>
						<li>{t("s08_li_uae")}</li>
						<li>{t("s08_li_ksa")}</li>
					</ul>
					<p className="text-muted-foreground leading-relaxed mt-3">{t("s08_p2")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s09_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{t("s09_body")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s10_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{t("s10_body")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s11_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{t("s11_body")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s12_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{t("s12_body")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s13_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{t("s13_body")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s14_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{t("s14_body")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s15_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{t("s15_body")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s16_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{t("s16_body")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s17_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{t("s17_body")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s18_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{t("s18_body")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s19_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{t("s19_body")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s20_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{t("s20_body")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s21_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{t("s21_body")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s22_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed mb-3">{t("s22_p1")}</p>
					<ul className="list-disc ps-6 space-y-2 text-muted-foreground leading-relaxed">
						<li>{t("s22_li_egypt")}</li>
						<li>{t("s22_li_ksa")}</li>
						<li>{t("s22_li_uae")}</li>
						<li>{t("s22_li_gcc")}</li>
					</ul>
					<p className="text-muted-foreground leading-relaxed mt-3">{t("s22_p2")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s23_title")}
					</h2>
					<ul className="list-disc ps-6 space-y-2 text-muted-foreground leading-relaxed">
						<li>{t("s23_li_egypt")}</li>
						<li>{t("s23_li_uae")}</li>
						<li>{t("s23_li_ksa")}</li>
						<li>{t("s23_li_qatar")}</li>
						<li>{t("s23_li_bahrain")}</li>
						<li>{t("s23_li_oman")}</li>
						<li>{t("s23_li_kuwait")}</li>
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s24_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{t("s24_body")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s25_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed">{t("s25_body")}</p>
				</section>
			</div>
		</div>
	);
}
