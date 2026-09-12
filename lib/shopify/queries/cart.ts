/** Storefront API — cart creation for Shopify's hosted checkout */

// `@inContext(language:)` does double duty here. It is what makes the hosted
// checkout at `checkoutUrl` render in the buyer's language, and it sets the
// order's customer locale, which picks the language of Shopify's own order
// confirmation email. There is no query parameter on `checkoutUrl` for this.
// https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/markets/multiple-languages
//
// The `$language` variable is injected by `shopifyFetch` when `language` is passed.

/** Creates a cart and returns the hosted checkout URL for it. */
export const cartCreateMutation = `
  mutation cartCreate($input: CartInput!, $language: LanguageCode!)
  @inContext(language: $language) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
        code
      }
      warnings {
        code
        message
        target
      }
    }
  }
`;
