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

export const getProductByHandleQuery = `
  query getProduct($handle: String!, $language: LanguageCode!)
  @inContext(language: $language) {
    product(handle: $handle) {
      id
      title
      descriptionHtml
      images(first: 5) {
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
      variants(first: 1) {
        edges {
          node {
            id
            availableForSale
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
