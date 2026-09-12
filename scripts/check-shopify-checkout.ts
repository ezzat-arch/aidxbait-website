// Self-check for the pure checkout helpers: phone normalisation, cart pre-fill
// mapping and the checkout-domain rewrite. No network, no database, no store
// credentials needed. Fails loudly on the first broken assertion.
//
// Run: npx tsx scripts/check-shopify-checkout.ts
import assert from "node:assert/strict";
import { toCheckoutDomain } from "../lib/shopify/checkout-url";
import {
	buildPrefilledCartInput,
	composeAddress2,
	toE164EgyptPhone,
	PATIENT_ID_CART_ATTRIBUTE,
	type CheckoutPrefill,
} from "../lib/shopify/map-checkout-prefill";
import type { PatientAddress } from "../lib/order-types";

// --- toE164EgyptPhone: every shape a buyer might have typed
assert.equal(toE164EgyptPhone("01001234567"), "+201001234567");
assert.equal(toE164EgyptPhone("0100 123 4567"), "+201001234567");
assert.equal(toE164EgyptPhone("(0100) 123-4567"), "+201001234567");
assert.equal(toE164EgyptPhone("+20 100 123 4567"), "+201001234567");
assert.equal(toE164EgyptPhone("+20 0100 123 4567"), "+201001234567"); // stray national 0
assert.equal(toE164EgyptPhone("00201001234567"), "+201001234567");
assert.equal(toE164EgyptPhone("201001234567"), "+201001234567");
assert.equal(toE164EgyptPhone("0223456789"), "+20223456789"); // Cairo landline
assert.equal(toE164EgyptPhone("+1 (613) 555-1111"), "+16135551111"); // foreign passes through
assert.equal(toE164EgyptPhone("123"), undefined);
assert.equal(toE164EgyptPhone("   "), undefined);
assert.equal(toE164EgyptPhone(""), undefined);
assert.equal(toE164EgyptPhone(null), undefined);
assert.equal(toE164EgyptPhone(undefined), undefined);
assert.equal(toE164EgyptPhone("+0100123456"), undefined); // E.164 never starts with 0

// --- toCheckoutDomain: only *.myshopify.com hosts are rewritten, path + query survive
const cartUrl =
	"https://doctoory-eg.myshopify.com/cart/c/Z2NwLXVzLWVhc3QxOjAx?key=abc123";
assert.equal(
	toCheckoutDomain(cartUrl, "shop.doctoory.com"),
	"https://shop.doctoory.com/cart/c/Z2NwLXVzLWVhc3QxOjAx?key=abc123"
);
assert.equal(
	toCheckoutDomain(cartUrl, " Shop.Doctoory.com "),
	"https://shop.doctoory.com/cart/c/Z2NwLXVzLWVhc3QxOjAx?key=abc123"
);
assert.equal(toCheckoutDomain(cartUrl, undefined), cartUrl);
assert.equal(toCheckoutDomain(cartUrl, "  "), cartUrl);
assert.equal(
	toCheckoutDomain("https://checkout.shopify.com/c/123", "shop.doctoory.com"),
	"https://checkout.shopify.com/c/123"
);
assert.equal(toCheckoutDomain("not a url", "shop.doctoory.com"), "not a url");

// --- composeAddress2: Egyptian building/floor/apartment onto Shopify's second line
assert.equal(
	composeAddress2({ building_name: "12", floor: "3", apartment: "5" }),
	"Bldg 12, Floor 3, Apt 5"
);
assert.equal(
	composeAddress2({ building_name: null, floor: " ", apartment: "5" }),
	"Apt 5"
);
assert.equal(
	composeAddress2({ building_name: null, floor: null, apartment: null }),
	undefined
);

// --- buildPrefilledCartInput
// Guest: store country only, nothing else, so checkout still prices in EGP.
assert.deepEqual(buildPrefilledCartInput(null), {
	buyerIdentity: { countryCode: "EG" },
});

const address: PatientAddress = {
	id: 1,
	patient_id: 7,
	address_type: "Apartment",
	address_label: "Home",
	google_map_url: null,
	latitude: null,
	longitude: null,
	governorate: "Cairo",
	city: "Nasr City",
	street: "12 Abbas El Akkad",
	building_name: "Tower B",
	floor: "4",
	apartment: "12",
	additional_directions: null,
	phone: "0100 123 4567",
	is_primary: true,
	is_deleted: false,
	created_at: "",
	updated_at: "",
};
const full = buildPrefilledCartInput({
	patientId: 7,
	email: " buyer@example.com ",
	phone: "+201119876543",
	firstName: "Sara",
	lastName: "Ali",
	address,
});
// Address phone beats account phone: it is the number the courier calls.
assert.deepEqual(full.buyerIdentity, {
	countryCode: "EG",
	email: "buyer@example.com",
	phone: "+201001234567",
});
assert.deepEqual(full.attributes, [
	{ key: PATIENT_ID_CART_ATTRIBUTE, value: "7" },
]);
assert.deepEqual(full.delivery, {
	addresses: [
		{
			selected: true,
			validationStrategy: "COUNTRY_CODE_ONLY",
			address: {
				deliveryAddress: {
					countryCode: "EG",
					firstName: "Sara",
					lastName: "Ali",
					address1: "12 Abbas El Akkad",
					address2: "Bldg Tower B, Floor 4, Apt 12",
					city: "Nasr City",
					phone: "+201001234567",
				},
			},
		},
	],
});
// Governorate is free text in our DB; the buyer picks it at checkout.
assert.ok(
	!("provinceCode" in full.delivery!.addresses[0].address.deliveryAddress)
);

// Signed in, no saved address, unparseable phone: identity only, no delivery block.
const partial: CheckoutPrefill = {
	patientId: null,
	email: "x@y.z",
	phone: "abc",
	firstName: null,
	lastName: null,
	address: null,
};
assert.deepEqual(buildPrefilledCartInput(partial), {
	buyerIdentity: { countryCode: "EG", email: "x@y.z" },
});

console.log("check-shopify-checkout: all assertions passed");
