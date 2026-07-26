------------------------------------------------------------------------------
-- BLOG: RELATED PRODUCTS FROM SHOPIFY
-- Run this whole file in the Supabase SQL Editor (Dashboard > SQL Editor).
-- It is idempotent: safe to run more than once.
--
-- The public storefront sells SHOPIFY products (not the internal `products`
-- table), so blog "related products" must reference Shopify products — that
-- way the website can link each card to /services/store/products/[handle].
--
-- What it does:
--   1. Drops the old `post_products` join table (posts <-> internal products)
--      and the two anon-read policies 009 added on products/product_images
--      for it (no longer needed).
--   2. Creates `post_shopify_products`: one row per (post, Shopify handle),
--      ordered, with a display snapshot (title/image/price) captured when the
--      admin picks the product in the dashboard. The website fetches LIVE
--      data from Shopify by handle at render time and only falls back to the
--      snapshot when Shopify is unreachable.
--   3. RLS: public read for rows of PUBLISHED posts (same convention as the
--      other blog tables from 009).
------------------------------------------------------------------------------

------------------------------------------------------------------------------
-- 1. Remove the internal-products relation from 009
------------------------------------------------------------------------------
DROP TABLE IF EXISTS post_products CASCADE;
DROP POLICY IF EXISTS products_read_blog_related ON products;
DROP POLICY IF EXISTS product_images_read_blog_related ON product_images;

------------------------------------------------------------------------------
-- 2. `post_shopify_products`
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_shopify_products
(
    post_id            INTEGER      NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
    handle             VARCHAR(255) NOT NULL,
    shopify_product_id VARCHAR(255),
    title              VARCHAR(255) NOT NULL,
    image_url          TEXT,
    price_amount       VARCHAR(50),
    currency_code      VARCHAR(10),
    display_order      INTEGER      NOT NULL DEFAULT 0,
    created_at         TIMESTAMPTZ           DEFAULT NOW(),
    updated_at         TIMESTAMPTZ           DEFAULT NOW(),
    PRIMARY KEY (post_id, handle)
);
COMMENT ON COLUMN post_shopify_products.handle IS 'Shopify product handle - links to /services/store/products/[handle]';
COMMENT ON COLUMN post_shopify_products.shopify_product_id IS 'Shopify gid (informational)';
COMMENT ON COLUMN post_shopify_products.title IS 'Snapshot for dashboard display + website fallback; the website prefers live Shopify data';

CREATE INDEX IF NOT EXISTS idx_post_shopify_products_post_id ON post_shopify_products (post_id);
CREATE INDEX IF NOT EXISTS idx_post_shopify_products_handle ON post_shopify_products (handle);
CREATE INDEX IF NOT EXISTS idx_post_shopify_products_display_order ON post_shopify_products (display_order);

------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (public read for published posts, like 009)
------------------------------------------------------------------------------
ALTER TABLE post_shopify_products ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'post_shopify_products'
          AND policyname = 'post_shopify_products_read_published'
    ) THEN
        CREATE POLICY post_shopify_products_read_published
            ON post_shopify_products FOR SELECT TO public
            USING (EXISTS (SELECT 1 FROM posts p
                           WHERE p.id = post_shopify_products.post_id
                             AND p.status = 'published'));
    END IF;
END
$$;

------------------------------------------------------------------------------
-- DONE. Verify after running:
--   SELECT policyname FROM pg_policies WHERE tablename = 'post_shopify_products';
--   SELECT to_regclass('post_products');          -- should be NULL
------------------------------------------------------------------------------
