import crypto from "crypto";

// Paymob API base URL
const PAYMOB_API_BASE = "https://accept.paymob.com/api";

// Environment variables
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY!;
const PAYMOB_SECRET_KEY = process.env.PAYMOB_SECRET_KEY!;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID!;
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID!;

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
export function verifyHMAC(callbackData: Record<string, any>, requireHmac: boolean = true): boolean {
	try {
		console.log("[Paymob HMAC] Starting verification...");
		console.log(`[Paymob HMAC] HMAC required: ${requireHmac}`);
		
		// Verify environment variables are loaded
		if (!PAYMOB_SECRET_KEY) {
			console.error("[Paymob HMAC] PAYMOB_SECRET_KEY is not defined!");
			return false;
		}
		console.log(`[Paymob HMAC] Secret key loaded: ${PAYMOB_SECRET_KEY.substring(0, 10)}...${PAYMOB_SECRET_KEY.substring(PAYMOB_SECRET_KEY.length - 10)} (length: ${PAYMOB_SECRET_KEY.length})`);
		
		const receivedHmac = callbackData.hmac;
		
		if (!receivedHmac) {
			if (!requireHmac) {
				console.warn("[Paymob HMAC] No HMAC signature found, but HMAC not required for this callback type. Proceeding without verification.");
				return true;
			}
			console.error("[Paymob HMAC] No HMAC signature found in callback data");
			return false;
		}
		
		// If HMAC is present, always verify it regardless of requireHmac flag
		console.log("[Paymob HMAC] HMAC signature found, proceeding with verification...");

		// Extract field values - handle both nested (POST) and flat (GET) structures
		// CRITICAL: Use values as-is, don't use String() conversion which adds extra quotes
		// For GET requests, values are already strings; for POST they are proper types
		const extractOrderId = () => {
			if (typeof callbackData.order === "object" && callbackData.order !== null) {
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
				callbackData.source_data?.pan ??
				callbackData.source_data_pan ??
				"",
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
			`[Paymob HMAC] Concatenated string (length: ${concatenatedString.length}):`,
			concatenatedString.substring(0, 100) + "..."
		);

		// Generate HMAC using SHA512
		const calculatedHmac = crypto
			.createHmac("sha512", PAYMOB_SECRET_KEY)
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
		console.log(`[Paymob HMAC] Verification result: ${isValid ? "✓ PASSED" : "✗ FAILED"}`);

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
 * Generate Paymob payment URL
 */
export function getPaymobPaymentUrl(paymentToken: string): string {
	return `${PAYMOB_API_BASE}/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;
}
