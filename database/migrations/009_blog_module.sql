------------------------------------------------------------------------------
-- BLOG MODULE MIGRATION
-- Run this whole file in the Supabase SQL Editor (Dashboard > SQL Editor).
-- It is idempotent: safe to run more than once.
--
-- Blog posts are created/edited from the management dashboard and displayed
-- on the public website in English and Arabic.
--
-- What it adds:
--   1. `post_statuses` enum: draft / published / archived
--   2. `posts`             : one row per post (status, featured image, author)
--   3. `post_translations` : one row per (post, language) - en / ar. Holds
--                            title, slug, rich-text content, excerpt and the
--                            SEO meta fields
--   4. `post_items`        : ordered content blocks under a translation, each
--                            with a rich-text body plus optional image /
--                            video / link
--   5. `post_products`     : posts <-> products many-to-many (related products)
--   6. RLS: enabled on all four tables, with explicit PUBLIC READ policies for
--      published posts (the website reads these tables directly with the anon
--      key; the dashboard writes through the service role which bypasses RLS).
--      Also adds scoped public-read policies on products/product_images
--      limited to products referenced by a published post, so the website can
--      render related-product cards.
--      NOTE: these are intentionally the first table-level policies in the
--      project - every other table is service-role-only.
--   7. Storage bucket `blog-images` (public) + public read policy. Uploads
--      happen from the dashboard API with the service role key.
------------------------------------------------------------------------------

------------------------------------------------------------------------------
-- 1. ENUM
------------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_statuses') THEN
        CREATE TYPE post_statuses AS ENUM ('draft', 'published', 'archived');
    END IF;
END
$$;

------------------------------------------------------------------------------
-- 2. `posts`
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts
(
    id             SERIAL PRIMARY KEY,
    status         post_statuses NOT NULL DEFAULT 'draft',
    featured_image TEXT,
    user_id        INTEGER       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    published_at   TIMESTAMPTZ,
    created_at     TIMESTAMPTZ            DEFAULT NOW(),
    updated_at     TIMESTAMPTZ            DEFAULT NOW()
);
COMMENT ON COLUMN posts.user_id IS 'Author: the dashboard admin''s row in `users`';
COMMENT ON COLUMN posts.published_at IS 'Set the first time status becomes published';

CREATE INDEX IF NOT EXISTS idx_posts_status ON posts (status);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts (user_id);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts (published_at);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at);
CREATE INDEX IF NOT EXISTS idx_posts_updated_at ON posts (updated_at);

------------------------------------------------------------------------------
-- 3. `post_translations` (one per post per language, en / ar)
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_translations
(
    id               SERIAL PRIMARY KEY,
    post_id          INTEGER      NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
    language         VARCHAR(5)   NOT NULL CHECK (language IN ('en', 'ar')),
    title            VARCHAR(255) NOT NULL,
    slug             VARCHAR(255) NOT NULL,
    content          TEXT         NOT NULL,
    excerpt          TEXT,
    meta_title       VARCHAR(255),
    meta_description TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (post_id, language),
    UNIQUE (slug)
);
COMMENT ON COLUMN post_translations.slug IS 'URL slug, unique across ALL translations (site route: /blog/[slug])';

CREATE INDEX IF NOT EXISTS idx_post_translations_post_id ON post_translations (post_id);
CREATE INDEX IF NOT EXISTS idx_post_translations_language ON post_translations (language);
CREATE INDEX IF NOT EXISTS idx_post_translations_slug ON post_translations (slug);
CREATE INDEX IF NOT EXISTS idx_post_translations_title ON post_translations (title);

------------------------------------------------------------------------------
-- 4. `post_items` (ordered content blocks under a translation)
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_items
(
    id                  SERIAL PRIMARY KEY,
    post_translation_id INTEGER NOT NULL REFERENCES post_translations (id) ON DELETE CASCADE,
    body                TEXT    NOT NULL,
    image               TEXT,
    video               TEXT,
    link                TEXT,
    display_order       INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ      DEFAULT NOW(),
    updated_at          TIMESTAMPTZ      DEFAULT NOW()
);
COMMENT ON COLUMN post_items.display_order IS 'Render order of the block within its translation, ascending';

CREATE INDEX IF NOT EXISTS idx_post_items_post_translation_id ON post_items (post_translation_id);
CREATE INDEX IF NOT EXISTS idx_post_items_display_order ON post_items (display_order);

------------------------------------------------------------------------------
-- 5. `post_products` (related products, many-to-many)
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_products
(
    post_id    INTEGER NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_post_products_post_id ON post_products (post_id);
CREATE INDEX IF NOT EXISTS idx_post_products_product_id ON post_products (product_id);

------------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
--    The website reads these tables DIRECTLY with the anon key, so published
--    posts get explicit public-read policies. Drafts/archived stay invisible.
--    The dashboard writes with the service role key (bypasses RLS).
------------------------------------------------------------------------------
ALTER TABLE posts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_products     ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'posts'
          AND policyname = 'posts_read_published'
    ) THEN
        CREATE POLICY posts_read_published
            ON posts FOR SELECT TO public
            USING (status = 'published');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'post_translations'
          AND policyname = 'post_translations_read_published'
    ) THEN
        CREATE POLICY post_translations_read_published
            ON post_translations FOR SELECT TO public
            USING (EXISTS (SELECT 1 FROM posts p
                           WHERE p.id = post_translations.post_id
                             AND p.status = 'published'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'post_items'
          AND policyname = 'post_items_read_published'
    ) THEN
        CREATE POLICY post_items_read_published
            ON post_items FOR SELECT TO public
            USING (EXISTS (SELECT 1 FROM post_translations pt
                           JOIN posts p ON p.id = pt.post_id
                           WHERE pt.id = post_items.post_translation_id
                             AND p.status = 'published'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'post_products'
          AND policyname = 'post_products_read_published'
    ) THEN
        CREATE POLICY post_products_read_published
            ON post_products FOR SELECT TO public
            USING (EXISTS (SELECT 1 FROM posts p
                           WHERE p.id = post_products.post_id
                             AND p.status = 'published'));
    END IF;

    -- The website renders related-product cards (name, image, price) with the
    -- anon key, so products/product_images referenced by a PUBLISHED post need
    -- a scoped read policy too (they are otherwise service-role-only).
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'products'
          AND policyname = 'products_read_blog_related'
    ) THEN
        CREATE POLICY products_read_blog_related
            ON products FOR SELECT TO public
            USING (EXISTS (SELECT 1 FROM post_products pp
                           JOIN posts p ON p.id = pp.post_id
                           WHERE pp.product_id = products.id
                             AND p.status = 'published'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'product_images'
          AND policyname = 'product_images_read_blog_related'
    ) THEN
        CREATE POLICY product_images_read_blog_related
            ON product_images FOR SELECT TO public
            USING (EXISTS (SELECT 1 FROM post_products pp
                           JOIN posts p ON p.id = pp.post_id
                           WHERE pp.product_id = product_images.product_id
                             AND p.status = 'published'));
    END IF;
END
$$;

------------------------------------------------------------------------------
-- 7. STORAGE BUCKET for blog images (featured images + item images)
--    Public bucket; the dashboard uploads with the service role key and the
--    website embeds the public URLs.
------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', TRUE)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
          AND policyname = 'blog_images_read_public'
    ) THEN
        CREATE POLICY blog_images_read_public
            ON storage.objects FOR SELECT TO public
            USING (bucket_id = 'blog-images');
    END IF;
END
$$;

------------------------------------------------------------------------------
-- DONE. The existing event trigger `on_create_table_add_updated_at`
-- automatically attaches updated_at triggers to the new tables.
--
-- Verify after running:
--   SELECT id, status FROM posts LIMIT 1;
--   SELECT policyname FROM pg_policies WHERE tablename LIKE 'post%';
--   SELECT id, public FROM storage.buckets WHERE id = 'blog-images';
------------------------------------------------------------------------------
