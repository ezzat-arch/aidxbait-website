export default {
	meta: {
		title: "Return & Refund Policy | Doctoory",
		description:
			"How Doctoory handles returns, exchanges, cancellations, and refunds for medical goods and healthcare services in Egypt and the GCC.",
	},
	header: {
		h1: "Return & Refund Policy",
		updatedLabel: "Last updated:",
		updatedValue: "01-01-2026",
	},
	links: {
		site: "https://www.doctoory.com",
		siteDisplay: "www.doctoory.com",
		mail: "support@doctoory.com",
		phone: "00201000088905",
		phoneHref: "tel:+201000088905",
	},
	intro: {
		p1: "This Return & Refund Policy explains how we handle returns, exchanges, cancellations, and refunds for:",
		ordered: [
			"Medical goods & equipment sold through our online platforms; and",
			"Medical services, including online medical consultations and home visits.",
		],
		p2: "This Policy is designed to comply with applicable consumer protection laws in Egypt and GCC countries where we operate. If any provision of this Policy conflicts with mandatory local law in your country, that local law will prevail and we will apply the rule that is more favorable to you as a consumer.",
	},
	s1: {
		h: "1. Definitions",
		intro: "In this Policy:",
		defs: [
			{
				label: `"Company", "we", "us", "our"`,
				body: "means Doctoory, a limited liability company registered in Egypt.",
			},
			{
				label: `"Platform"`,
				body: "means our website",
				bodyAfterLink: "and any mobile applications or digital channels we operate.",
			},
			{
				label: `"Goods"`,
				body: "means medical goods & equipment sold through our Platform (e.g., braces, supports, medical devices, equipment, consumables).",
			},
			{
				label: `"Services"`,
				body: "means online medical consultations, tele-consultations, and home visits provided by our licensed healthcare professionals.",
			},
			{
				label: `"Customer", "you", "your"`,
				body: "means any individual purchasing Goods or Services from us for personal (non-business) use.",
			},
		],
	},
	s2: {
		h: "2. Your Legal Rights",
		intro: "Nothing in this Policy limits your rights granted by local consumer protection laws, such as:",
		items: [
			"Right to return or exchange products within a minimum legal period (for example, 14 days from receipt in many Egypt & GCC frameworks), provided they are in their original condition and not excluded by law (for example, certain health-related goods).",
			"Extended rights for defective or non-conforming products (often up to 30 days or more to claim repair, replacement, or refund if the product is faulty or does not match its description).",
		],
		footer:
			"Where our Policy offers a longer or more generous period than the minimum legal requirement, our Policy will apply.",
	},
	partA: { h: "Part A — Returns & Refunds for Medical Goods & Equipment" },
	s3: {
		h: "3. General Principles",
		p1: "3.1. We aim to ensure that all Goods are supplied safe, new, and as described.",
		p2: "3.2. Returns are divided into three main categories:",
		cats: [
			{ tag: "(A)", text: `"Change of mind" / not suitable;` },
			{ tag: "(B)", text: "Defective, damaged, or non-conforming items;" },
			{ tag: "(C)", text: "Goods that cannot be returned for health, hygiene, or safety reasons." },
		],
	},
	s4: {
		h: `4. "Change-of-Mind" Returns (Non-Defective Goods)`,
		p1: "4.1. For most eligible Goods, you may request a return or exchange within:",
		p1Items: [
			"<b>14 days</b> from the date you receive the Goods; or",
			"Any longer mandatory period required by consumer law in your country (if applicable).",
		],
		p2: "4.2. Conditions for accepting change-of-mind returns:",
		p2Items: [
			"The Goods must be unused, unworn, and undamaged.",
			"All original packaging, seals, labels, hygiene stickers, tags, manuals, and accessories must be intact and included.",
			"You must provide proof of purchase (invoice, receipt, or order confirmation).",
			"You are responsible for the cost of return shipping for change-of-mind returns, unless local law requires otherwise.",
		],
		p3: "4.3. If these conditions are not met, or if the product is a non-returnable medical product (see Section 6), we may refuse the return or offer a partial refund at our sole discretion, where permitted by law.",
	},
	s5: {
		h: "5. Defective, Damaged, or Incorrect Goods",
		p1: "5.1. If the Goods:",
		ifList: [
			"Arrive damaged,",
			"Are defective,",
			"Are unsafe, or",
			"Do not match the description, order, or specifications on our Platform,",
		],
		p2: "you have the right to request <b>repair</b>, <b>replacement</b>, or <b>refund</b> in accordance with applicable consumer law.",
		p3: "5.2. You must notify us within a reasonable period after you discover the issue, preferably:",
		p3Items: [
			"Within <b>3 days</b> of delivery for visible damage or wrong items; and",
			"Within <b>30 days</b> of delivery for hidden defects or non-conformity, or any longer period required by local law.",
		],
		p4: "5.3. In these cases:",
		p4Items: [
			"We will bear the cost of return shipping (pickup or drop-off) where reasonably possible.",
			{
				lead: "After inspection and confirmation of the defect or error, we will offer one of the following (as permitted by law and depending on availability):",
				nested: [
					"Repair of the product;",
					"Replacement with the same or equivalent item;",
					"Full refund to your original payment method.",
				],
			},
		],
		p5: "5.4. If the Goods have been misused, damaged by you, or altered contrary to instructions, we may reject the claim or offer a paid repair if feasible.",
	},
	s6: {
		h: "6. Health & Hygiene — Non-Returnable Items",
		p1: "Because we deal with medical products, certain items <b>cannot be returned</b> once supplied, except where they are defective or not as described, in line with health and safety guidelines in Egypt and GCC states.",
		p2: "Non-returnable items (unless defective) typically include, but are not limited to:",
		numbered: [
			"Single-use or disposable medical items, once opened (e.g., syringes, wound dressings, test kits, disposable electrodes).",
			"Sterile medical devices and consumables where the sterile seal is broken.",
			{
				lead: "Items that come into direct contact with the body that cannot be hygienically re-sold, such as:",
				nested: [
					"Orthopedic braces, supports, splints, corsets, belts, compression garments, insoles, and similar wearable medical items after use or if packaging is opened.",
				],
			},
			"Customized or made-to-measure items, such as custom orthotics, customized braces, or products manufactured according to your measurements or prescription.",
			"Any other product category that is explicitly exempted from return under the consumer protection laws in the country of delivery.",
		],
		labelNote:
			"We will clearly label such items on our Platform as <b>\"Non-returnable for health & hygiene reasons unless defective\"</b>.",
	},
	s7: {
		h: "7. Condition of Returned Goods",
		p1: "To process your return smoothly:",
		items1: [
			"Pack the Goods securely in the original packaging (if possible).",
			"Include all accessories, manuals, free gifts, and proof of purchase.",
			"Provide clear photos of any damage or defect before shipping, when requested.",
		],
		p2: "We reserve the right to inspect the returned Goods. If we determine that the product is not defective or has been damaged by misuse, we may:",
		items2: [
			"Return the item back to you; or",
			"Offer a partial refund or paid repair option, where permitted by law.",
		],
	},
	s8: {
		h: "8. Return & Refund Process for Goods",
		intro: "To request a return:",
		steps: [
			{
				lead: "Contact us within the applicable time frame at:",
				contacts: [
					{ label: "Email:", kind: "email" as const },
					{ label: "Phone / WhatsApp:", kind: "phone" as const },
					{ label: "App / Website:", kind: "site" as const },
				],
			},
			{
				lead: "Provide:",
				bullets: [
					"Order number,",
					"Product details,",
					"Reason for return, and",
					"Photos/videos (if defective or damaged).",
				],
			},
			{
				lead: "We will inform you whether:",
				bullets: [
					"We will arrange courier pickup, or",
					"Ask you to drop off the item at a specified location/partner.",
				],
			},
			{
				lead: "Once we receive and inspect the Goods:",
				bullets: [
					"If approved, we will process repair/replacement/refund.",
					"If rejected, we will explain the reasons and your legal options.",
				],
			},
		],
	},
	s9: {
		h: "9. Refund Method & Timeframe (Goods)",
		items: [
			"Refunds are normally processed to the <b>original payment method</b> (e.g., card, wallet, bank transfer).",
			"For cash-on-delivery orders, we may refund via bank transfer, wallet credit, or other method as we specify and as permitted by law.",
			"We aim to complete the refund within <b>7–14 working days</b> after approving the return. Actual time may depend on your bank or payment provider.",
		],
		footer:
			"If mandatory law in your country requires a shorter maximum refund time, we will follow that requirement.",
	},
	partB: {
		h: "Part B — Online Medical Consultations & Home Visits",
		p: "Medical Services involve professional time and scheduling, so the rules for cancellations and refunds are different from those for Goods.",
	},
	s10: {
		h: "10. Nature of Services",
		items: [
			"Our Services are provided by licensed healthcare professionals in accordance with local healthcare regulations.",
			"Services are intended for medical advice, assessment, and follow-up, <b>not for emergency care</b>.",
			"Once a consultation or home visit is completed, the service is considered <b>delivered</b>.",
		],
	},
	s11: {
		h: "11. Booking, Cancellation & Rescheduling",
		s111h: "11.1. Booking Confirmation",
		s111p:
			"Your booking is confirmed only when you receive our booking confirmation (via app, SMS, email, or WhatsApp).",
		s112h: "11.2. Customer-initiated Cancellation (Before Service)",
		s112p:
			"Unless stricter or more generous rules are required by local law, we apply the following:",
		s112Tiers: [
			{
				title: "More than 24 hours before the scheduled time:",
				items: [
					"You may cancel or reschedule free of charge.",
					"You may choose a full refund or credit for a future appointment.",
				],
			},
			{
				title: "Between 4 and 24 hours before the scheduled time:",
				items: [
					"A cancellation fee of <b>up to 50%</b> of the service price may be charged.",
					"The remaining 50% (if any) will be refunded or left as credit.",
				],
			},
			{
				title: "Less than 4 hours before the scheduled time, or no-show:",
				items: [
					"The service is considered consumed, and <b>no refund</b> is normally issued, unless required by local law or in exceptional circumstances (e.g., verified medical emergency).",
				],
			},
		],
		s113h: "11.3. Rescheduling",
		s113p:
			"Where possible, we may offer one free reschedule within a specified time frame instead of cancellation. Further rescheduling may incur fees.",
	},
	s12: {
		h: "12. Provider-initiated Cancellation or Delay",
		p1: "If we cancel or significantly delay your consultation or home visit (for reasons not related to your actions):",
		items: [
			{
				lead: "You may choose between:",
				nested: [
					"Rescheduling at a convenient time; or",
					"Receiving a <b>full refund</b> of any fees paid for that booking.",
				],
			},
		],
		footer:
			"If the clinician arrives late but still performs the full service on the same day, no refund is usually due unless local law provides otherwise or the delay is unreasonable.",
	},
	s13: {
		h: "13. Refunds After the Service Has Been Provided",
		s131h: "13.1. Completed Consultations / Visits",
		s131p:
			"Once the consultation or home visit takes place, the fee covers the professional time and expertise, and <b>no refund is usually provided</b>—even if you disagree with the medical opinion, unless there has been:",
		s131items: [
			"A serious service failure (e.g., the clinician did not provide the agreed service at all); or",
			"A technical failure entirely attributable to us (e.g., platform crash preventing meaningful consultation).",
		],
		s132h: "13.2. Technical Issues (Online Consultations)",
		s132items: [
			"If the consultation cannot proceed due to technical issues from our side, and we cannot fix or reschedule it within a reasonable time, you are entitled to a <b>full refund</b> or free rebooking.",
			"If the issue is due to your device, internet connection, or equipment, we may offer one rescheduling at our discretion. Further issues may be treated as late cancellation or no-show, subject to fees.",
		],
	},
	s14: {
		h: "14. Service Packages & Subscriptions",
		p1: "For any multi-session packages or subscription plans:",
		items: [
			"Specific terms (including cancellation and refund conditions) will be clearly displayed at the time of purchase.",
			"Where allowed by law, we may apply <b>pro-rated refunds</b> for unused sessions, minus any applicable discounts that depended on you completing the full package.",
		],
	},
	partC: { h: "Part C — Country-Specific Notes" },
	s15: {
		h: "15. Egypt",
		p1: "For customers in Egypt, this Policy is intended to comply with <b>Consumer Protection Law No. 181 of 2018</b> and its executive regulations, including the right to return or exchange products within <b>14 days</b> without cause and within <b>30 days</b> if the product is defective or non-conforming, subject to the legal exceptions for certain goods and health-related items.",
		p2: "Where our Policy is more favorable than the minimum legal standard, our Policy will apply.",
	},
	s16: {
		h: "16. GCC Countries",
		p1: "For customers in GCC countries (such as Kuwait, Saudi Arabia, United Arab Emirates, Qatar, Bahrain, and Oman):",
		items: [
			{
				lead: "We aim to align our practices with local consumer protection laws on returns, warranties, and defective products, including:",
				nested: [
					"General rights to return or exchange within a defined period (often around 7–14 days for online purchases, depending on the jurisdiction);",
					"Special handling and exemptions for health-related, hygiene, and customized products;",
					"The consumer's right to repair, replacement, or refund for defective or unsafe goods and deficient services.",
				],
			},
		],
		footer:
			"If a specific GCC country where we operate has stricter consumer protection rules than those stated here, we will follow the stricter rule.",
	},
	s17: {
		h: "17. Limitation of Liability & Medical Disclaimer",
		items: [
			"Our liability will always be limited in accordance with applicable local law and any limitations permitted for medical and e-commerce services.",
			"Our Services <b>do not replace emergency medical care</b>. In case of emergency, you must contact local emergency services immediately.",
		],
	},
	s18: {
		h: "18. Contact Details",
		p1: "If you have any questions or wish to submit a return, cancellation, or refund request, please contact us:",
		lines: [
			{ label: "Company Name:", value: "Doctoory", kind: "text" as const },
			{ label: "Registered Address:", value: "17 Fawzi Fahim, Giza, Egypt", kind: "text" as const },
			{ label: "Email:", kind: "email" as const },
			{ label: "Phone / WhatsApp:", kind: "phone" as const },
			{ label: "Website:", kind: "site" as const },
		],
	},
} as const;
