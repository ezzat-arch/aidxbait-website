/**
 * Public contact details shown across the site (contact section, footer, ...).
 * Keep this as the single source of truth so the number only changes in one place.
 */
export const SITE_PHONE = {
	/** Human-readable, as shown in the UI */
	display: "+20 10 62424224",
	/** E.164 form used for tel: links */
	e164: "+201062424224",
} as const;

export const SITE_PHONE_TEL_HREF = `tel:${SITE_PHONE.e164}`;
