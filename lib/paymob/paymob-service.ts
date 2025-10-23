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
 */
export function verifyHMAC(callbackData: Record<string, any>): boolean {
	try {
		const receivedHmac = callbackData.hmac;

		// Concatenate the required fields in the specific order
		const concatenatedString = [
			callbackData.amount_cents || "",
			callbackData.created_at || "",
			callbackData.currency || "",
			callbackData.error_occured || "",
			callbackData.has_parent_transaction || "",
			callbackData.id || "",
			callbackData.integration_id || "",
			callbackData.is_3d_secure || "",
			callbackData.is_auth || "",
			callbackData.is_capture || "",
			callbackData.is_refunded || "",
			callbackData.is_standalone_payment || "",
			callbackData.is_voided || "",
			callbackData.order?.id || callbackData.order || "",
			callbackData.owner || "",
			callbackData.pending || "",
			callbackData.source_data?.pan || callbackData.source_data_pan || "",
			callbackData.source_data?.sub_type ||
				callbackData.source_data_sub_type ||
				"",
			callbackData.source_data?.type || callbackData.source_data_type || "",
			callbackData.success || "",
		].join("");

		// Generate HMAC using SHA512
		const calculatedHmac = crypto
			.createHmac("sha512", PAYMOB_SECRET_KEY)
			.update(concatenatedString)
			.digest("hex");

		return calculatedHmac === receivedHmac;
	} catch (error) {
		console.error("[Paymob] HMAC verification error:", error);
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
