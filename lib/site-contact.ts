/**
 * Public contact details shown across the site (contact page, contact section, footer, ...).
 * Keep this as the single source of truth so a number or address only changes in one place.
 *
 * Human-readable labels for these values are translated in `messages/*.json`; the values
 * themselves (numbers, emails, URLs) are locale independent and live here.
 */
export const SITE_PHONE = {
	/** Human-readable, as shown in the UI */
	display: "+20 10 62424224",
	/** E.164 form used for tel: links */
	e164: "+201062424224",
} as const;

export const SITE_PHONE_TEL_HREF = `tel:${SITE_PHONE.e164}`;

/**
 * WhatsApp line. This is the "Phone / WhatsApp" number published in the
 * Return & Refund Policy (`app/[locale]/return-and-refund-policy/strings-*.ts`).
 */
export const SITE_WHATSAPP = {
	/** Human-readable, as shown in the UI */
	display: "+20 10 00088905",
	/** E.164 form used for tel: links */
	e164: "+201000088905",
	/** Digits only, as required by wa.me links */
	waDigits: "201000088905",
} as const;

export const SITE_WHATSAPP_TEL_HREF = `tel:${SITE_WHATSAPP.e164}`;

/** Opens a WhatsApp chat with the support line (web or app, decided by WhatsApp). */
export const SITE_WHATSAPP_CHAT_HREF = `https://wa.me/${SITE_WHATSAPP.waDigits}`;

export const SITE_EMAIL = "support@doctoory.com";
export const SITE_EMAIL_HREF = `mailto:${SITE_EMAIL}`;

export const SITE_WEBSITE = {
	display: "www.doctoory.com",
	href: "https://www.doctoory.com",
} as const;

/**
 * Registered address. The localised, human-readable text lives in
 * `contact.page.text.address_value` in the message files; this is only the maps link.
 */
export const SITE_ADDRESS_MAPS_HREF =
	"https://www.google.com/maps/search/?api=1&query=" +
	encodeURIComponent("17 Fawzi Faheem, Giza, Egypt");
