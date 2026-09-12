-- 011_shopify_orders — 2026-09-10 — idempotent

ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS shopify_variant_id TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS shopify_product_id TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS shopify_handle TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS title_snapshot TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_title_snapshot TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS image_url_snapshot TEXT;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'order_items_single_catalog'
	) THEN
		ALTER TABLE order_items
			ADD CONSTRAINT order_items_single_catalog
			CHECK (product_id IS NULL OR shopify_variant_id IS NULL);
	END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_order_items_shopify_variant_id
	ON order_items (shopify_variant_id)
	WHERE shopify_variant_id IS NOT NULL;

ALTER TABLE orders ALTER COLUMN patient_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN shipping_address_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN billing_address_id DROP NOT NULL;

ALTER TABLE orders
	ADD COLUMN IF NOT EXISTS channel VARCHAR(10) NOT NULL DEFAULT 'mobile';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS locale VARCHAR(5);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shopify_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shopify_order_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shopify_order_status_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shopify_updated_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_shipping_address JSONB;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'orders_channel_valid'
	) THEN
		ALTER TABLE orders
			ADD CONSTRAINT orders_channel_valid
			CHECK (channel IN ('website', 'mobile'));
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'orders_has_owner'
	) THEN
		ALTER TABLE orders
			ADD CONSTRAINT orders_has_owner
			CHECK (patient_id IS NOT NULL OR guest_email IS NOT NULL);
	END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_shopify_order_id
	ON orders (shopify_order_id)
	WHERE shopify_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_guest_email
	ON orders (guest_email)
	WHERE patient_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_orders_patient_active
	ON orders (patient_id)
	WHERE soft_deleted = false;

DO $$
DECLARE
	missing TEXT;
	col RECORD;
	expected CONSTANT JSONB := '{
		"address_label": 100,
		"governorate": 100,
		"city": 100,
		"street": 255,
		"additional_directions": 500,
		"phone": 20
	}';
BEGIN
	SELECT string_agg(required.table_name || '.' || required.column_name, ', ')
	INTO missing
	FROM (
		VALUES
			('order_items', 'shopify_variant_id'),
			('order_items', 'shopify_product_id'),
			('order_items', 'shopify_handle'),
			('order_items', 'title_snapshot'),
			('order_items', 'variant_title_snapshot'),
			('order_items', 'image_url_snapshot'),
			('orders', 'channel'),
			('orders', 'locale'),
			('orders', 'shopify_order_id'),
			('orders', 'shopify_order_name'),
			('orders', 'shopify_order_status_url'),
			('orders', 'shopify_updated_at'),
			('orders', 'guest_email'),
			('orders', 'guest_shipping_address')
	) AS required(table_name, column_name)
	WHERE NOT EXISTS (
		SELECT 1 FROM information_schema.columns c
		WHERE c.table_schema = 'public'
			AND c.table_name = required.table_name
			AND c.column_name = required.column_name
	);

	IF missing IS NOT NULL THEN
		RAISE EXCEPTION 'Migration 011 failed, missing columns: %', missing;
	END IF;

	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'orders'
			AND column_name = 'patient_id' AND is_nullable = 'NO'
	) THEN
		RAISE EXCEPTION 'Migration 011 failed: orders.patient_id is still NOT NULL, so guest orders cannot be stored';
	END IF;

	FOR col IN
		SELECT column_name, character_maximum_length
		FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'patient_addresses'
			AND column_name IN (
				'address_label', 'governorate', 'city', 'street',
				'additional_directions', 'phone'
			)
	LOOP
		IF col.character_maximum_length IS NOT NULL
			AND col.character_maximum_length
				< (expected ->> col.column_name)::int THEN
			RAISE EXCEPTION
				'patient_addresses.% is VARCHAR(%), narrower than the % assumed by ADDRESS_FIELD_LENGTHS in lib/shopify/map-order-address.ts',
				col.column_name, col.character_maximum_length,
				(expected ->> col.column_name)::int;
		END IF;
	END LOOP;

	RAISE NOTICE 'Migration 011 completed: Shopify order columns are live.';
END $$;

DO $$
DECLARE
	needed CONSTANT JSONB := '{
		"payment_status": ["pending", "completed", "failed", "refunded"],
		"order_status": ["pending", "confirmed", "shipped", "delivered", "cancelled"],
		"order_type": ["purchase"],
		"payment_method": ["online"]
	}';
	col RECORD;
	label TEXT;
	absent TEXT;
BEGIN
	FOR col IN
		SELECT c.column_name, c.udt_name
		FROM information_schema.columns c
		WHERE c.table_schema = 'public'
			AND c.table_name = 'orders'
			AND c.column_name IN (
				'payment_status', 'order_status', 'order_type', 'payment_method'
			)
	LOOP
		IF NOT EXISTS (
			SELECT 1 FROM pg_type t
			WHERE t.typname = col.udt_name AND t.typtype = 'e'
		) THEN
			RAISE NOTICE
				'orders.% is %, not an enum, so its allowed values were not checked here',
				col.column_name, col.udt_name;
			CONTINUE;
		END IF;

		FOR label IN
			SELECT jsonb_array_elements_text(needed -> col.column_name)
		LOOP
			IF NOT EXISTS (
				SELECT 1
				FROM pg_enum e
				JOIN pg_type t ON t.oid = e.enumtypid
				WHERE t.typname = col.udt_name AND e.enumlabel = label
			) THEN
				absent := COALESCE(absent || ', ', '')
					|| col.column_name || ' = ' || label;
			END IF;
		END LOOP;
	END LOOP;

	IF absent IS NOT NULL THEN
		RAISE EXCEPTION
			'The order webhook writes values these enums do not have: %. Add the labels, or change the mapping in lib/shopify/map-webhook-order.ts.',
			absent;
	END IF;

	RAISE NOTICE 'Migration 011: every label the order webhook writes exists.';
END $$;
