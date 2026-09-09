/**
 * Cart size limits, shared by the checkout route, the quantity steppers and the
 * cart sidebar so they can never disagree.
 *
 * ponytail: sanity caps, not business rules. Shopify enforces real stock and
 * real per-variant limits at cart creation; these only stop a runaway payload
 * from reaching it and give the UI something to disable a "+" button on.
 */
export const MAX_LINES = 50;
export const MAX_QUANTITY_PER_LINE = 99;

/** Every cart line is keyed on a variant global id, never a product id. */
export const VARIANT_GID_PREFIX = "gid://shopify/ProductVariant/";
