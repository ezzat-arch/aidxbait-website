import crypto from "crypto";

// Paymob API base URL
const PAYMOB_API_BASE = "https://accept.paymob.com/api";

// Environment variables
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY!;
const PAYMOB_SECRET_KEY = process.env.PAYMOB_SECRET_KEY!;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID!;
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID!;

// HMAC key - separate key from Paymob dashboard specifically for callback verification
// Falls back to PAYMOB_SECRET_KEY if PAYMOB_HMAC_SECRET is not set (for backward compatibility)
const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET || PAYMOB_SECRET_KEY;

// HMAC Configuration
// Set to true to allow callbacks without HMAC (lenient mode)
// Set to false to require HMAC verification (strict mode)
export const ALLOW_CALLBACKS_WITHOUT_HMAC = false;

// Type definitions for Paymob API
export interface PaymobAuthResponse {
	token: string;
}

export interface PaymobOrderItem {
	name: string;
	amount_cents: string;
	description: string;
	quantity: string;
}

export interface PaymobOrderResponse {
	id: number;
	merchant_id: number;
	amount_cents: number;
	currency: string;
}

export interface PaymobBillingData {
	apartment: string;
	email: string;
	floor: string;
	first_name: string;
	street: string;
	building: string;
	phone_number: string;
	shipping_method: string;
	postal_code: string;
	city: string;
	country: string;
	last_name: string;
	state: string;
}

export interface PaymobPaymentKeyResponse {
	token: string;
}

export interface PaymobTransactionResponse {
	id: number;
	success: boolean;
	pending: boolean;
	amount_cents: number;
	currency: string;
	order: {
		id: number;
		merchant_order_id: string;
	};
	payment_key_claims: {
		billing_data: PaymobBillingData;
	};
}

// Types for Unified Intention API (Mobile SDK)
export interface UnifiedIntentionItem {
	name: string;
	amount: number;
	quantity: number;
	description?: string;
}

export interface UnifiedIntentionBillingData {
	first_name: string;
	last_name: string;
	email: string;
	phone_number: string;
	apartment?: string;
	floor?: string;
	street?: string;
	building?: string;
	city?: string;
	state?: string;
	country?: string;
	postal_code?: string;
}

export interface UnifiedIntentionResponse {
	id: string;
	client_secret: string;
	intention_detail: {
		amount: number;
		currency: string;
	};
	payment_methods: number[];
}

/**
 * Authenticate with Paymob and get auth token
 */
export async function authenticatePaymob(): Promise<string> {
	try {
		const response = await fetch(`${PAYMOB_API_BASE}/auth/tokens`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				api_key: PAYMOB_API_KEY,
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`Paymob authentication failed: ${response.status} - ${errorText}`
			);
		}

		const data: PaymobAuthResponse = await response.json();
		return data.token;
	} catch (error) {
		console.error("[Paymob] Authentication error:", error);
		throw new Error("Failed to authenticate with Paymob");
	}
}

/**
 * Create an order in Paymob system
 */
export async function createPaymobOrder(
	authToken: string,
	amountCents: number,
	merchantOrderId: string,
	items: PaymobOrderItem[]
): Promise<PaymobOrderResponse> {
	try {
		const response = await fetch(`${PAYMOB_API_BASE}/ecommerce/orders`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				auth_token: authToken,
				delivery_needed: "false",
				amount_cents: amountCents.toString(),
				currency: "EGP",
				merchant_order_id: merchantOrderId,
				items: items,
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`Paymob order creation failed: ${response.status} - ${errorText}`
			);
		}

		const data: PaymobOrderResponse = await response.json();
		return data;
	} catch (error) {
		console.error("[Paymob] Order creation error:", error);
		throw new Error("Failed to create order in Paymob");
	}
}

/**
 * Generate payment key for checkout
 */
export async function generatePaymentKey(
	authToken: string,
	amountCents: number,
	paymobOrderId: number,
	billingData: PaymobBillingData
): Promise<string> {
	try {
		const response = await fetch(`${PAYMOB_API_BASE}/acceptance/payment_keys`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				auth_token: authToken,
				amount_cents: amountCents.toString(),
				expiration: 3600, // 1 hour
				order_id: paymobOrderId.toString(),
				billing_data: billingData,
				currency: "EGP",
				integration_id: PAYMOB_INTEGRATION_ID,
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`Paymob payment key generation failed: ${response.status} - ${errorText}`
			);
		}

		const data: PaymobPaymentKeyResponse = await response.json();
		return data.token;
	} catch (error) {
		console.error("[Paymob] Payment key generation error:", error);
		throw new Error("Failed to generate payment key");
	}
}

/**
 * Verify HMAC signature from Paymob callback
 * Uses SHA512 with specific field concatenation order as per Paymob documentation
 * @param callbackData - The callback data received from Paymob
 * @param requireHmac - Whether to require HMAC (default: true). Set to false for POST callbacks which may not include HMAC
 */
export function verifyHMAC(
	callbackData: Record<string, any>,
	requireHmac: boolean = true
): boolean {
	try {
		console.log("[Paymob HMAC] Starting verification...");
		console.log(`[Paymob HMAC] HMAC required: ${requireHmac}`);

		// Verify environment variables are loaded
		if (!PAYMOB_HMAC_SECRET) {
			console.error("[Paymob HMAC] PAYMOB_HMAC_SECRET is not defined!");
			return false;
		}
		const usingDedicatedHmacKey = process.env.PAYMOB_HMAC_SECRET !== undefined;
		console.log(
			`[Paymob HMAC] Using ${
				usingDedicatedHmacKey ? "dedicated HMAC key" : "secret key as fallback"
			}`
		);
		console.log(
			`[Paymob HMAC] HMAC key loaded: ${PAYMOB_HMAC_SECRET.substring(
				0,
				10
			)}...${PAYMOB_HMAC_SECRET.substring(
				PAYMOB_HMAC_SECRET.length - 10
			)} (length: ${PAYMOB_HMAC_SECRET.length})`
		);

		const receivedHmac = callbackData.hmac;

		// If HMAC verification is not required, skip it entirely
		if (!requireHmac) {
			if (!receivedHmac) {
				console.warn(
					"[Paymob HMAC] No HMAC signature found, but HMAC verification is disabled. Proceeding without verification."
				);
			} else {
				console.warn(
					"[Paymob HMAC] HMAC signature found, but HMAC verification is disabled. Skipping verification."
				);
			}
			return true;
		}

		// HMAC is required - check if it's present
		if (!receivedHmac) {
			console.error(
				"[Paymob HMAC] No HMAC signature found in callback data (HMAC required)"
			);
			return false;
		}

		// HMAC is required and present - verify it
		console.log(
			"[Paymob HMAC] HMAC signature found, proceeding with verification..."
		);

		// Extract field values - handle both nested (POST) and flat (GET) structures
		// CRITICAL: Use values as-is, don't use String() conversion which adds extra quotes
		// For GET requests, values are already strings; for POST they are proper types
		const extractOrderId = () => {
			if (
				typeof callbackData.order === "object" &&
				callbackData.order !== null
			) {
				return callbackData.order.id ?? "";
			}
			return callbackData.order ?? "";
		};

		const fields = {
			amount_cents: callbackData.amount_cents ?? "",
			created_at: callbackData.created_at ?? "",
			currency: callbackData.currency ?? "",
			error_occured: callbackData.error_occured ?? "",
			has_parent_transaction: callbackData.has_parent_transaction ?? "",
			id: callbackData.id ?? "",
			integration_id: callbackData.integration_id ?? "",
			is_3d_secure: callbackData.is_3d_secure ?? "",
			is_auth: callbackData.is_auth ?? "",
			is_capture: callbackData.is_capture ?? "",
			is_refunded: callbackData.is_refunded ?? "",
			is_standalone_payment: callbackData.is_standalone_payment ?? "",
			is_voided: callbackData.is_voided ?? "",
			order_id: extractOrderId(),
			owner: callbackData.owner ?? "",
			pending: callbackData.pending ?? "",
			source_data_pan:
				callbackData.source_data?.pan ?? callbackData.source_data_pan ?? "",
			source_data_sub_type:
				callbackData.source_data?.sub_type ??
				callbackData.source_data_sub_type ??
				"",
			source_data_type:
				callbackData.source_data?.type ?? callbackData.source_data_type ?? "",
			success: callbackData.success ?? "",
		};

		// Debug logging - log all field values
		console.log("[Paymob HMAC] Field values:");
		Object.entries(fields).forEach(([key, value]) => {
			console.log(`  ${key}: "${value}" (type: ${typeof value})`);
		});

		// Concatenate fields in the exact order specified by Paymob
		const concatenatedString = [
			fields.amount_cents,
			fields.created_at,
			fields.currency,
			fields.error_occured,
			fields.has_parent_transaction,
			fields.id,
			fields.integration_id,
			fields.is_3d_secure,
			fields.is_auth,
			fields.is_capture,
			fields.is_refunded,
			fields.is_standalone_payment,
			fields.is_voided,
			fields.order_id,
			fields.owner,
			fields.pending,
			fields.source_data_pan,
			fields.source_data_sub_type,
			fields.source_data_type,
			fields.success,
		].join("");

		console.log(
			`[Paymob HMAC] Concatenated string (length: ${concatenatedString.length}):`
		);
		console.log(
			`[Paymob HMAC] Full concatenated string: "${concatenatedString}"`
		);

		// Generate HMAC using SHA512
		const calculatedHmac = crypto
			.createHmac("sha512", PAYMOB_HMAC_SECRET)
			.update(concatenatedString)
			.digest("hex");

		// Log HMAC comparison
		console.log(
			`[Paymob HMAC] Calculated HMAC (first 40 chars): ${calculatedHmac.substring(
				0,
				40
			)}...`
		);
		console.log(
			`[Paymob HMAC] Received HMAC (first 40 chars):   ${receivedHmac.substring(
				0,
				40
			)}...`
		);

		const isValid = calculatedHmac === receivedHmac;
		console.log(
			`[Paymob HMAC] Verification result: ${isValid ? "✓ PASSED" : "✗ FAILED"}`
		);

		if (!isValid) {
			console.error("[Paymob HMAC] HMAC mismatch detected!");
			console.error(`[Paymob HMAC] Full calculated: ${calculatedHmac}`);
			console.error(`[Paymob HMAC] Full received:   ${receivedHmac}`);
		}

		return isValid;
	} catch (error) {
		console.error("[Paymob HMAC] Verification error:", error);
		return false;
	}
}

/**
 * Get transaction status from Paymob
 */
export async function getTransactionStatus(
	transactionId: number
): Promise<PaymobTransactionResponse> {
	try {
		// First authenticate to get token
		const authToken = await authenticatePaymob();

		const response = await fetch(
			`${PAYMOB_API_BASE}/acceptance/transactions/${transactionId}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`Paymob transaction inquiry failed: ${response.status} - ${errorText}`
			);
		}

		const data: PaymobTransactionResponse = await response.json();
		return data;
	} catch (error) {
		console.error("[Paymob] Transaction status error:", error);
		throw new Error("Failed to get transaction status from Paymob");
	}
}

/**
 * Create a payment intention using Unified Intention API (for Mobile SDK)
 * This returns a client_secret that can be used with the Paymob React Native SDK
 */
export async function createUnifiedIntention(
	amountCents: number,
	items: UnifiedIntentionItem[],
	billingData: UnifiedIntentionBillingData,
	specialReference: string
): Promise<{ client_secret: string; intention_id: string }> {
	try {
		console.log("[Paymob Mobile] Creating unified intention...");
		console.log("[Paymob Mobile] Amount:", amountCents, "piasters");
		console.log("[Paymob Mobile] Reference:", specialReference);

		const response = await fetch("https://accept.paymob.com/v1/intention/", {
			method: "POST",
			headers: {
				Authorization: `Token ${PAYMOB_SECRET_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				amount: amountCents,
				currency: "EGP",
				payment_methods: [parseInt(PAYMOB_INTEGRATION_ID)],
				items: items.map((item) => ({
					name: item.name,
					amount: item.amount,
					quantity: item.quantity,
					description: item.description || item.name,
				})),
				billing_data: {
					first_name: billingData.first_name,
					last_name: billingData.last_name,
					email: billingData.email,
					phone_number: billingData.phone_number,
					apartment: billingData.apartment || "N/A",
					floor: billingData.floor || "N/A",
					street: billingData.street || "N/A",
					building: billingData.building || "N/A",
					city: billingData.city || "Cairo",
					state: billingData.state || "Cairo",
					country: billingData.country || "EG",
					postal_code: billingData.postal_code || "00000",
				},
				special_reference: specialReference,
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("[Paymob Mobile] Intention creation failed:", errorText);
			throw new Error(
				`Paymob intention creation failed: ${response.status} - ${errorText}`
			);
		}

		const data: UnifiedIntentionResponse = await response.json();
		console.log("[Paymob Mobile] Intention created successfully:", data.id);

		return {
			client_secret: data.client_secret,
			intention_id: data.id,
		};
	} catch (error) {
		console.error("[Paymob Mobile] Intention creation error:", error);
		throw new Error(
			error instanceof Error
				? error.message
				: "Failed to create payment intention"
		);
	}
}

/**
 * Generate Paymob payment URL
 */
export function getPaymobPaymentUrl(paymentToken: string): string {
	return `${PAYMOB_API_BASE}/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;
}
