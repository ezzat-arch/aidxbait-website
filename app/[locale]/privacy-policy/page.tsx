import type { ReactNode } from "react";
import {
	getTranslations,
	setRequestLocale,
} from "next-intl/server";

const em = (chunks: ReactNode) => (
	<strong className="text-foreground">{chunks}</strong>
);
const strongOnly = (chunks: ReactNode) => <strong>{chunks}</strong>;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const t = await getTranslations({
		locale,
		namespace: "legal.privacy_policy",
	});

	return {
		title: t("meta_title"),
		description: t("meta_description"),
	};
}

export default async function PrivacyPolicyPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("legal.privacy_policy");

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
						<strong className="text-foreground">{t("intro_who_label")}</strong>{" "}
						{t("intro_who_text")}
					</p>
					<p>
						<strong className="text-foreground">{t("intro_services_label")}</strong>{" "}
						{t("intro_services_text")}
					</p>
					<div>
						<strong className="text-foreground">{t("intro_contacts_label")}</strong>
						<ul className="list-disc ps-6 mt-2 space-y-1">
							<li>
								<strong>{t("intro_li_email_label")}</strong>{" "}
								<a
									href={`mailto:${t("support_email")}`}
									className="text-primary hover:underline"
								>
									{t("support_email")}
								</a>
							</li>
							<li>
								<strong>{t("intro_li_complaints_label")}:</strong>{" "}
								{t("intro_li_complaints_detail")}
							</li>
						</ul>
					</div>
					<p>{t("intro_agreement")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s01_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed mb-3">
						{t.rich("s01_intro", {
							pd: em,
							hd: em,
						})}
					</p>
					<ul className="list-disc ps-6 space-y-2 text-muted-foreground leading-relaxed">
						<li>{t("s01_li_account")}</li>
						<li>{t("s01_li_contact")}</li>
						<li>{t("s01_li_transactional")}</li>
						<li>{t("s01_li_medical")}</li>
						<li>{t("s01_li_telehealth")}</li>
						<li>{t("s01_li_location")}</li>
						<li>{t("s01_li_payment")}</li>
						<li>{t("s01_li_marketing")}</li>
						<li>{t("s01_li_technical")}</li>
					</ul>
					<p className="text-muted-foreground leading-relaxed mt-3">
						{t.rich("s01_footer", { no: strongOnly })}
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s02_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed mb-3">{t("s02_intro")}</p>
					<ul className="list-disc ps-6 space-y-2 text-muted-foreground leading-relaxed">
						<li>{t("s02_li_care")}</li>
						<li>{t("s02_li_ecommerce")}</li>
						<li>{t("s02_li_quality")}</li>
						<li>{t("s02_li_security")}</li>
						<li>{t("s02_li_improvement")}</li>
						<li>{t("s02_li_marketing")}</li>
					</ul>
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
					<p className="text-muted-foreground leading-relaxed">{t("s04_body")}</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s05_title")}
					</h2>
					<ul className="list-disc ps-6 space-y-2 text-muted-foreground leading-relaxed">
						<li>{t("s05_li_recordings")}</li>
						<li>{t("s05_li_emergency")}</li>
						<li>{t("s05_li_messaging")}</li>
					</ul>
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
					<ul className="list-disc ps-6 space-y-2 text-muted-foreground leading-relaxed">
						<li>{t("s07_li_providers")}</li>
						<li>{t("s07_li_vendors")}</li>
						<li>{t("s07_li_insurers")}</li>
						<li>{t("s07_li_regulators")}</li>
						<li>{t("s07_li_transfers")}</li>
					</ul>
					<p className="text-muted-foreground leading-relaxed mt-3">
						{t.rich("s07_footer", { no: strongOnly })}
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s08_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed mb-3">{t("s08_intro")}</p>
					<ul className="list-disc ps-6 space-y-2 text-muted-foreground leading-relaxed">
						<li>{t("s08_li_uae")}</li>
						<li>{t("s08_li_ksa")}</li>
						<li>{t("s08_li_egypt")}</li>
						<li>{t("s08_li_qbo")}</li>
						<li>{t("s08_li_kuwait")}</li>
					</ul>
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
					<ul className="list-disc ps-6 space-y-2 text-muted-foreground leading-relaxed">
						<li>{t("s10_li_medical")}</li>
						<li>{t("s10_li_ecommerce")}</li>
						<li>{t("s10_li_marketing_support")}</li>
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s11_title")}
					</h2>
					<p className="text-muted-foreground leading-relaxed mb-3">{t("s11_intro")}</p>
					<ul className="list-disc ps-6 space-y-2 text-muted-foreground leading-relaxed mb-3">
						<li>{t("s11_li_rights")}</li>
						<li>{t("s11_li_sensitive")}</li>
					</ul>
					<p className="text-muted-foreground leading-relaxed mb-3">
						<strong className="text-foreground">{t("s11_contacts_header")}</strong>
					</p>
					<ul className="list-disc ps-6 space-y-2 text-muted-foreground leading-relaxed">
						<li>{t("s11_li_reg_egypt")}</li>
						<li>{t("s11_li_reg_uae")}</li>
						<li>{t("s11_li_reg_ksa")}</li>
						<li>{t("s11_li_reg_qatar")}</li>
						<li>{t("s11_li_reg_bahrain")}</li>
						<li>{t("s11_li_reg_oman")}</li>
					</ul>
					<p className="text-muted-foreground leading-relaxed mt-3">
						{t.rich("s11_exercise_rights", {
							dpo: em,
						})}
					</p>
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
					<p className="text-muted-foreground leading-relaxed">
						{t.rich("s14_body", {
							no: strongOnly,
							rev: em,
						})}
					</p>
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

					<h3 className="text-xl font-semibold text-foreground mt-4 mb-2">
						{t("s18_egypt_title")}
					</h3>
					<ul className="list-disc ps-6 space-y-2 text-muted-foreground leading-relaxed">
						<li>{t("s18_egypt_li1")}</li>
						<li>{t("s18_egypt_li2")}</li>
						<li>{t("s18_egypt_li3")}</li>
					</ul>

					<h3 className="text-xl font-semibold text-foreground mt-4 mb-2">
						{t("s18_uae_title")}
					</h3>
					<ul className="list-disc ps-6 space-y-2 text-muted-foreground leading-relaxed">
						<li>{t("s18_uae_li1")}</li>
						<li>{t("s18_uae_li2")}</li>
					</ul>

					<h3 className="text-xl font-semibold text-foreground mt-4 mb-2">
						{t("s18_ksa_title")}
					</h3>
					<ul className="list-disc ps-6 space-y-2 text-muted-foreground leading-relaxed">
						<li>{t("s18_ksa_li1")}</li>
					</ul>

					<h3 className="text-xl font-semibold text-foreground mt-4 mb-2">
						{t("s18_qbo_title")}
					</h3>
					<ul className="list-disc ps-6 space-y-2 text-muted-foreground leading-relaxed">
						<li>{t("s18_qbo_li1")}</li>
					</ul>

					<h3 className="text-xl font-semibold text-foreground mt-4 mb-2">
						{t("s18_kw_title")}
					</h3>
					<ul className="list-disc ps-6 space-y-2 text-muted-foreground leading-relaxed">
						<li>{t("s18_kw_li1")}</li>
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-foreground mb-3">
						{t("s19_title")}
					</h2>
					<ul className="list-disc ps-6 space-y-2 text-muted-foreground leading-relaxed">
						<li>{t("s19_li_egypt")}</li>
						<li>{t("s19_li_uae")}</li>
						<li>{t("s19_li_ksa")}</li>
					</ul>
				</section>

				<section className="mb-8 border-t border-border pt-6">
					<h2 className="text-xl font-semibold text-foreground mb-3">
						{t("s20_notes_title")}
					</h2>
					<p className="text-sm text-muted-foreground leading-relaxed">
						{t("s20_notes_body")}
					</p>
				</section>
			</div>
		</div>
	);
}
