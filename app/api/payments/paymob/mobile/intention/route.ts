import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
	createUnifiedIntention,
	type UnifiedIntentionItem,
	type UnifiedIntentionBillingData,
} from "@/lib/paymob/paymob-service";

const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!,
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	}
);

// Mobile-specific Paymob configuration
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;

// Paymob's post_pay URL - required for the SDK to intercept redirects and trigger callbacks
const PAYMOB_POST_PAY_URL = "https://accept.paymob.com/api/acceptance/post_pay";

// Request body type for mobile payment intention
interface MobileIntentionRequest {
	amount: number; // Amount in piasters (cents)
	currency: "EGP";
	items: {
		name: string;
		amount: number;
		quantity: number;
	}[];
	billing_data: {
		first_name: string;
		last_name: string;
		email: string;
		phone_number: string;
	};
	metadata: {
		order_type: "store" | "program" | "consultation";
		order_id: string;
		patient_id: number;
	};
}

export async function POST(request: NextRequest) {
	try {
		// Verify authorization header
		const authHeader = request.headers.get("Authorization");
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return NextResponse.json(
				{
					success: false,
					error: { type: "AuthError", message: "Missing authorization token" },
				},
				{ status: 401 }
			);
		}

		const token = authHeader.replace("Bearer ", "");

		// Verify the user token with Supabase
		const { data: userData, error: authError } =
			await supabaseAdmin.auth.getUser(token);
		if (authError || !userData.user) {
			console.error("[Paymob Mobile Intention] Auth error:", authError);
			return NextResponse.json(
				{
					success: false,
					error: { type: "AuthError", message: "Invalid authorization token" },
				},
				{ status: 401 }
			);
		}

		const body: MobileIntentionRequest = await request.json();

		// Validate required fields
		if (!body.amount || !body.items || !body.billing_data || !body.metadata) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "ValidationError",
						message: "Missing required fields",
					},
				},
				{ status: 400 }
			);
		}

		// Validate patient_id matches authenticated user
		const { data: patient, error: patientError } = await supabaseAdmin
			.from("patients")
			.select("id, user_id")
			.eq("id", body.metadata.patient_id)
			.single();

		if (patientError || !patient) {
			console.error(
				"[Paymob Mobile Intention] Patient not found:",
				patientError
			);
			return NextResponse.json(
				{
					success: false,
					error: { type: "ValidationError", message: "Invalid patient ID" },
				},
				{ status: 400 }
			);
		}

		// Verify patient belongs to authenticated user
		const { data: user, error: userError } = await supabaseAdmin
			.from("users")
			.select("id, supabase_id")
			.eq("id", patient.user_id)
			.single();

		if (userError || !user || user.supabase_id !== userData.user.id) {
			console.error("[Paymob Mobile Intention] User mismatch");
			return NextResponse.json(
				{
					success: false,
					error: { type: "AuthError", message: "Unauthorized patient access" },
				},
				{ status: 403 }
			);
		}

		console.log(
			"[Paymob Mobile Intention] Creating intention for patient:",
			body.metadata.patient_id
		);
		console.log(
			"[Paymob Mobile Intention] Order type:",
			body.metadata.order_type
		);
		console.log("[Paymob Mobile Intention] Amount:", body.amount, "piasters");

		// Log payment method configuration
		if (!PAYMOB_INTEGRATION_ID) {
			console.warn(
				"[Paymob Mobile Intention] PAYMOB_INTEGRATION_ID not set, using default integration"
			);
		} else {
			console.log(
				"[Paymob Mobile Intention] Using mobile integration ID:",
				PAYMOB_INTEGRATION_ID
			);
		}
		console.log("[Paymob Mobile Intention] Redirect URL:", PAYMOB_POST_PAY_URL);

		// Prepare items for Paymob
		const paymobItems: UnifiedIntentionItem[] = body.items.map((item) => ({
			name: item.name,
			amount: item.amount,
			quantity: item.quantity,
		}));

		// Prepare billing data
		const billingData: UnifiedIntentionBillingData = {
			first_name: body.billing_data.first_name,
			last_name: body.billing_data.last_name,
			email: body.billing_data.email,
			phone_number: body.billing_data.phone_number,
		};

		// Generate unique reference for this payment
		const specialReference = `mobile_${body.metadata.order_type}_${
			body.metadata.order_id
		}_${Date.now()}`;

		// Create the unified intention with mobile-specific configuration
		const { client_secret, intention_id } = await createUnifiedIntention(
			body.amount,
			paymobItems,
			billingData,
			specialReference,
			{
				// Use mobile-specific integration ID if configured
				integrationId: PAYMOB_INTEGRATION_ID || undefined,
				// Use Paymob's post_pay URL so the SDK can intercept the redirect
				// and trigger the payment listener callback
				redirectionUrl: PAYMOB_POST_PAY_URL,
			}
		);

		// For store orders, update the order with the intention details
		if (body.metadata.order_type === "store" && body.metadata.order_id) {
			const { error: updateError } = await supabaseAdmin
				.from("orders")
				.update({
					paymob_order_id: intention_id, // Store intention_id as paymob_order_id for tracking
					updated_at: new Date().toISOString(),
				})
				.eq("id", body.metadata.order_id);

			if (updateError) {
				console.warn(
					"[Paymob Mobile Intention] Failed to update order:",
					updateError
				);
				// Continue anyway - payment can proceed, webhook will handle status
			}
		}

		console.log(
			"[Paymob Mobile Intention] Intention created successfully:",
			intention_id
		);

		return NextResponse.json({
			success: true,
			data: {
				client_secret,
				intention_id,
				amount_cents: body.amount,
				currency: body.currency,
				expires_at: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour expiry
			},
		});
	} catch (error) {
		console.error("[Paymob Mobile Intention] Unexpected error:", error);
		return NextResponse.json(
			{
				success: false,
				error: {
					type: "InternalError",
					message:
						error instanceof Error
							? error.message
							: "Failed to create payment intention",
				},
			},
			{ status: 500 }
		);
	}
}
