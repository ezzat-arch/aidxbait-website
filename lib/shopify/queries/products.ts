/** Storefront API — product listings and product-related operations */

// All queries accept `$language: LanguageCode!` and apply `@inContext(language:)`
// so Shopify returns the translated title/description/etc. for the current locale.
// The `$language` variable is injected automatically by `shopifyFetch` when a
// `language` is passed.

/** Product list filtered by Shopify search syntax (title, tags, collection:handle, etc.) */
export const searchProductsQuery = `
  query searchProducts($query: String!, $language: LanguageCode!)
  @inContext(language: $language) {
    products(first: 20, query: $query) {
      edges {
        node {
          id
          title
          handle
          description
          tags
          availableForSale
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export const getAllProductsQuery = `
  query getProducts($language: LanguageCode!)
  @inContext(language: $language) {
    products(first: 250) {
      edges {
        node {
          id
          title
          handle
          description
          tags
          availableForSale
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

/**
 * Single product, with every variant and every option value.
 *
 * `variants(first: 100)` rather than 1: with one variant the buyer silently
 * bought variant #1 of a multi-variant product. 100 is Shopify's own page size
 * and comfortably above the 100-variant default product limit.
 *
 * `quantityAvailable` is deliberately NOT requested. It needs the
 * `unauthenticated_read_product_inventory` scope on the Storefront token, and
 * without that scope Shopify answers with an ACCESS_DENIED error rather than a
 * null field — `shopifyFetch` throws on any `errors`, so asking for it would
 * take every product page down. `availableForSale` is the stock signal, and
 * Shopify caps over-ordered quantities when the cart is created.
 */
export const getProductByHandleQuery = `
  query getProduct($handle: String!, $language: LanguageCode!)
  @inContext(language: $language) {
    product(handle: $handle) {
      id
      title
      handle
      descriptionHtml
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      options {
        name
        optionValues {
          name
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            image {
              url
              altText
            }
          }
        }
      }
    }
  }
`;
export const getAllCollectionsQuery = `
  query getCollections($language: LanguageCode!)
  @inContext(language: $language) {
    collections(first: 10) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

export const getCollectionByHandleQuery = `
  query getCollection($handle: String!, $language: LanguageCode!)
  @inContext(language: $language) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      image {
        url
        altText
      }
      products(first: 20) {
        edges {
          node {
            id
            title
            handle
            description
            tags
            availableForSale
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;
