/** Storefront API — variant lookups by global id */

/**
 * The two things an order webhook needs and Shopify's order payload does not
 * carry: the product handle (for the link back to the product page) and an
 * image. `image` on a variant already falls back to the product's first image,
 * so no separate product image query is needed.
 *
 * `nodes(ids:)` takes the whole batch in one request, which matters here: the
 * webhook has about five seconds in total.
 */
export const getVariantSnapshotsQuery = `
  query variantSnapshots($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        image {
          url
        }
        product {
          handle
        }
      }
    }
  }
`;
