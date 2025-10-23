import { NextRequest, NextResponse } from "next/server";

/**
 * Debug endpoint to verify Paymob configuration
 * WARNING: Only use in development! Remove in production!
 */
export async function GET(request: NextRequest) {
	// Security check: Only allow in development
	if (process.env.NODE_ENV === "production") {
		return NextResponse.json(
			{ error: "Debug endpoint not available in production" },
			{ status: 403 }
		);
	}

	const config = {
		hasApiKey: !!process.env.PAYMOB_API_KEY,
		hasPublicKey: !!process.env.PAYMOB_PUBLIC_KEY,
		hasSecretKey: !!process.env.PAYMOB_SECRET_KEY,
		hasIntegrationId: !!process.env.PAYMOB_INTEGRATION_ID,
		hasIframeId: !!process.env.PAYMOB_IFRAME_ID,
		hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
		// Show masked versions for security
		apiKeyPreview: process.env.PAYMOB_API_KEY
			? `${process.env.PAYMOB_API_KEY.substring(0, 10)}...`
			: "NOT SET",
		publicKeyPreview: process.env.PAYMOB_PUBLIC_KEY
			? `${process.env.PAYMOB_PUBLIC_KEY.substring(0, 10)}...`
			: "NOT SET",
		secretKeyPreview: process.env.PAYMOB_SECRET_KEY
			? `${process.env.PAYMOB_SECRET_KEY.substring(0, 10)}...`
			: "NOT SET",
		integrationId: process.env.PAYMOB_INTEGRATION_ID || "NOT SET",
		iframeId: process.env.PAYMOB_IFRAME_ID || "NOT SET",
		siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "NOT SET",
		// Show what the payment URL would look like
		samplePaymentUrl: process.env.PAYMOB_IFRAME_ID
			? `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=SAMPLE_TOKEN`
			: "Cannot generate - PAYMOB_IFRAME_ID not set",
	};

	const allConfigured =
		config.hasApiKey &&
		config.hasPublicKey &&
		config.hasSecretKey &&
		config.hasIntegrationId &&
		config.hasIframeId &&
		config.hasSiteUrl;

	return NextResponse.json({
		status: allConfigured ? "✅ All configured" : "❌ Missing configuration",
		configuration: config,
		recommendations: !allConfigured
			? [
					!config.hasApiKey && "Add PAYMOB_API_KEY to .env.local",
					!config.hasPublicKey && "Add PAYMOB_PUBLIC_KEY to .env.local",
					!config.hasSecretKey && "Add PAYMOB_SECRET_KEY to .env.local",
					!config.hasIntegrationId &&
						"Add PAYMOB_INTEGRATION_ID to .env.local (from Settings > Payment Integrations)",
					!config.hasIframeId &&
						"Add PAYMOB_IFRAME_ID to .env.local (from Settings > Iframes)",
					!config.hasSiteUrl && "Add NEXT_PUBLIC_SITE_URL to .env.local",
			  ].filter(Boolean)
			: [
					"All environment variables are configured!",
					"Integration ID is used for payment key API calls",
					"Iframe ID is used for the payment page redirect URL",
			  ],
	});
}
