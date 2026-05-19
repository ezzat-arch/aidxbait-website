import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";

const createCartMutation = `
  mutation cartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

type CartCreateResponse = {
	cartCreate: {
		cart: { checkoutUrl: string } | null;
		userErrors: { field: string[] | null; message: string }[];
	};
};

export async function POST(request: Request) {
	try {
		const { variantId } = (await request.json()) as { variantId?: string };

		if (!variantId || typeof variantId !== "string") {
			return NextResponse.json(
				{ error: "variantId is required" },
				{ status: 400 }
			);
		}

		const { body } = await shopifyFetch<CartCreateResponse>({
			query: createCartMutation,
			variables: {
				input: {
					lines: [{ merchandiseId: variantId, quantity: 1 }],
				},
			},
			cache: "no-store",
		});

		const cartCreate = body.data?.cartCreate;
		const userErrors = cartCreate?.userErrors ?? [];
		if (userErrors.length > 0) {
			console.error("Shopify cartCreate userErrors:", userErrors);
			return NextResponse.json(
				{ error: userErrors[0]?.message ?? "Failed to create checkout" },
				{ status: 400 }
			);
		}

		const checkoutUrl = cartCreate?.cart?.checkoutUrl;
		if (!checkoutUrl) {
			return NextResponse.json(
				{ error: "Failed to create checkout" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ checkoutUrl });
	} catch (error) {
		console.error("Checkout API error:", error);
		return NextResponse.json(
			{ error: "Failed to create checkout" },
			{ status: 500 }
		);
	}
}
