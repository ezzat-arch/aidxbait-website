# E-commerce Event Tracking - Database Schema Documentation

**Last Updated:** October 26, 2025  
**Database:** Supabase PostgreSQL (Website Database)  
**Purpose:** Track user behavior, cart abandonment, and conversion funnel metrics

---

## Overview

This document describes the complete database schema for e-commerce event tracking, including all tables, types, indexes, functions, triggers, and scheduled jobs.

## Database Tables

### 1. `user_sessions`

Tracks unique user sessions for both guest and authenticated users.

**Purpose:** Session management and user activity tracking

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  device_fingerprint TEXT,
  user_agent TEXT,
  ip_address INET,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_started_at ON user_sessions(started_at);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);
```

**Fields:**
- `id`: Auto-generated UUID (primary key for foreign keys)
- `session_id`: Client-generated UUID stored in localStorage
- `user_id`: Linked when user authenticates
- `device_fingerprint`: Browser fingerprint for guest identification
- `is_active`: Automatically set to FALSE after 30 minutes of inactivity
- `ended_at`: Set when session marked as inactive

---

### 2. `product_views`

Tracks when users view product detail pages.

**Purpose:** Measure product interest and calculate browse abandonment

```sql
CREATE TABLE product_views (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_seconds INTEGER,
  referrer_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_views_session ON product_views(session_id);
CREATE INDEX idx_product_views_user ON product_views(user_id);
CREATE INDEX idx_product_views_product ON product_views(product_id);
CREATE INDEX idx_product_views_viewed_at ON product_views(viewed_at);
```

**Fields:**
- `duration_seconds`: Time spent on product page (tracked on exit)
- `referrer_url`: Where user came from

---

### 3. `cart_events`

Tracks all cart interactions.

**Purpose:** Detailed cart behavior analysis

```sql
CREATE TYPE cart_event_type AS ENUM (
  'add',
  'remove',
  'update_quantity',
  'clear',
  'open',
  'close'
);

CREATE TABLE cart_events (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  event_type cart_event_type NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER,
  rental_weeks INTEGER,
  previous_quantity INTEGER,
  cart_value_at_event DECIMAL(10, 2),
  cart_item_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cart_events_session ON cart_events(session_id);
CREATE INDEX idx_cart_events_user ON cart_events(user_id);
CREATE INDEX idx_cart_events_type ON cart_events(event_type);
CREATE INDEX idx_cart_events_product ON cart_events(product_id);
CREATE INDEX idx_cart_events_created_at ON cart_events(created_at);
```

**Event Types:**
- `add`: Item added to cart
- `remove`: Item removed from cart
- `update_quantity`: Quantity changed
- `clear`: Entire cart cleared
- `open`: Cart sidebar opened
- `close`: Cart sidebar closed

---

### 4. `cart_snapshots`

Periodic snapshots of complete cart state.

**Purpose:** Abandonment analysis and recovery campaigns

```sql
CREATE TABLE cart_snapshots (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  cart_items JSONB NOT NULL,
  total_value DECIMAL(10, 2) NOT NULL,
  item_count INTEGER NOT NULL,
  is_abandoned BOOLEAN DEFAULT FALSE,
  converted_to_order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cart_snapshots_session ON cart_snapshots(session_id);
CREATE INDEX idx_cart_snapshots_user ON cart_snapshots(user_id);
CREATE INDEX idx_cart_snapshots_abandoned ON cart_snapshots(is_abandoned);
CREATE INDEX idx_cart_snapshots_snapshot_at ON cart_snapshots(snapshot_at);
CREATE INDEX idx_cart_snapshots_order ON cart_snapshots(converted_to_order_id);
CREATE INDEX idx_cart_snapshots_session_snapshot ON cart_snapshots(session_id, snapshot_at DESC);
```

**JSONB Structure for `cart_items`:**
```json
[
  {
    "product_id": 123,
    "quantity": 2,
    "rental_weeks": 4,
    "price": 299.99
  }
]
```

---

### 5. `checkout_events`

Tracks checkout funnel progression.

**Purpose:** Measure checkout abandonment and identify drop-off points

```sql
CREATE TYPE checkout_event_type AS ENUM (
  'started',
  'address_selected',
  'payment_method_selected',
  'order_submitted',
  'payment_initiated',
  'payment_completed',
  'payment_failed',
  'abandoned'
);

CREATE TABLE checkout_events (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  event_type checkout_event_type NOT NULL,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  cart_value DECIMAL(10, 2),
  cart_item_count INTEGER,
  payment_method VARCHAR(50),
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_checkout_events_session ON checkout_events(session_id);
CREATE INDEX idx_checkout_events_user ON checkout_events(user_id);
CREATE INDEX idx_checkout_events_type ON checkout_events(event_type);
CREATE INDEX idx_checkout_events_order ON checkout_events(order_id);
CREATE INDEX idx_checkout_events_created_at ON checkout_events(created_at);
CREATE INDEX idx_checkout_events_session_type ON checkout_events(session_id, event_type);
```

**Event Flow:**
1. `started` → User lands on checkout page
2. `address_selected` → Shipping address chosen
3. `payment_method_selected` → Payment method selected
4. `order_submitted` → "Place Order" clicked
5. `payment_initiated` → Payment API called (online payment)
6. `payment_completed` → Payment successful
7. `payment_failed` → Payment failed
8. `abandoned` → User left without completing

---

### 6. `abandoned_cart_classification_logs`

Logs results from daily abandoned cart classification job.

**Purpose:** Monitor classification job performance and historical trends

```sql
CREATE TABLE abandoned_cart_classification_logs (
  id BIGSERIAL PRIMARY KEY,
  run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_processed INTEGER,
  total_value DECIMAL(10, 2),
  avg_cart_value DECIMAL(10, 2),
  avg_items DECIMAL(10, 2),
  with_user_id INTEGER,
  guest_carts INTEGER,
  browse_abandonment_count INTEGER,
  cart_abandonment_count INTEGER,
  checkout_abandonment_count INTEGER,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_classification_logs_run_at ON abandoned_cart_classification_logs(run_at);
```

---

## Database Functions

### 1. `classify_abandoned_carts()`

Main function to identify and mark abandoned carts.

**Purpose:** Daily job to classify carts older than 24 hours as abandoned

**Logic:**
1. Find cart snapshots older than 24 hours
2. Verify no order was created for those sessions
3. Mark as `is_abandoned = TRUE`
4. Calculate abandonment statistics
5. Return summary data

**Returns:** Table with classification statistics

**Run Schedule:** Daily at 2 AM via pg_cron

---

### 2. `classify_abandoned_carts_with_logging()`

Wrapper function that logs classification results.

**Purpose:** Execute classification and store historical results

**Logic:**
1. Call `classify_abandoned_carts()`
2. Log results to `abandoned_cart_classification_logs`
3. Track execution time

**Returns:** void

**Run Schedule:** Daily at 2 AM via pg_cron (replaces direct call to classify_abandoned_carts)

---

### 3. `check_abandoned_cart_on_session_end()`

Trigger function for real-time abandonment detection.

**Purpose:** Detect abandoned carts when session becomes inactive

**Logic:**
1. Triggered when `is_active` changes from TRUE to FALSE
2. Check if session inactive >30 minutes
3. Find latest cart snapshot with items
4. If no order exists, mark cart as abandoned
5. Insert `abandoned` checkout event if checkout was started

**Returns:** NEW (trigger return value)

**Trigger:** `AFTER UPDATE ON user_sessions`

---

### 4. `count_browse_abandonment(hours_ago)`

Helper function to count browse abandonment.

**Purpose:** Calculate sessions with product views but no cart adds

**Parameters:**
- `hours_ago` (INTEGER): Time window to analyze (default: 24)

**Returns:** INTEGER (count of sessions)

**Usage:** Called by `classify_abandoned_carts()`

---

### 5. `mark_inactive_sessions()`

Marks sessions as inactive after 30 minutes of inactivity.

**Purpose:** Automated session cleanup

**Logic:**
1. Find active sessions with `last_activity_at` >30 minutes ago
2. Set `is_active = FALSE`
3. Set `ended_at = last_activity_at`

**Returns:** INTEGER (count of updated sessions)

**Run Schedule:** Every 10 minutes via pg_cron

---

## Database Triggers

### 1. `trigger_check_abandoned_cart`

**Table:** `user_sessions`  
**Event:** AFTER UPDATE  
**Condition:** `OLD.is_active IS DISTINCT FROM NEW.is_active`  
**Function:** `check_abandoned_cart_on_session_end()`

**Purpose:** Automatically detect abandoned carts when sessions end

---

## Scheduled Jobs (pg_cron)

### 1. Daily Cart Classification

**Job Name:** `classify-abandoned-carts-daily`  
**Schedule:** `0 2 * * *` (2 AM daily)  
**Command:** `SELECT classify_abandoned_carts_with_logging()`

**Purpose:** Classify carts abandoned in the past 24 hours

---

### 2. Session Cleanup

**Job Name:** `mark-inactive-sessions`  
**Schedule:** `*/10 * * * *` (Every 10 minutes)  
**Command:** `SELECT mark_inactive_sessions()`

**Purpose:** Mark inactive sessions automatically

---

## Metrics & KPIs

### Cart Abandonment Rate
```sql
SELECT 
  ROUND((COUNT(*) FILTER (WHERE is_abandoned = TRUE)::DECIMAL / 
         NULLIF(COUNT(*), 0)) * 100, 2) as abandonment_rate
FROM cart_snapshots
WHERE snapshot_at >= NOW() - INTERVAL '30 days'
  AND item_count > 0;
```

### Checkout Abandonment Rate
```sql
SELECT 
  ROUND((COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'started')::DECIMAL - 
         COUNT(DISTINCT session_id) FILTER (WHERE event_type IN ('payment_completed', 'order_submitted'))) /
         NULLIF(COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'started'), 0) * 100, 2) as checkout_abandonment_rate
FROM checkout_events
WHERE created_at >= NOW() - INTERVAL '30 days';
```

### Browse Abandonment Rate
```sql
SELECT count_browse_abandonment(720); -- Last 30 days (24 * 30 hours)
```

---

## Data Retention Policy

### Retention Periods
- **Active Sessions:** Until marked inactive (30 min inactivity)
- **Session Data:** 90 days
- **Product Views:** 90 days
- **Cart Events:** 90 days
- **Cart Snapshots (Abandoned):** 12 months
- **Cart Snapshots (Converted):** 12 months
- **Checkout Events:** 12 months
- **Classification Logs:** Indefinite (small size)

### Cleanup Strategy
To be implemented in Phase 5:
- Archive old data to aggregated daily summaries
- Delete raw event data after retention period
- Keep abandoned cart data for recovery campaigns

---

## GDPR Compliance

### User Data Deletion
When a user requests data deletion:

```sql
-- Anonymize user_id but keep session data for analytics
UPDATE user_sessions SET user_id = NULL WHERE user_id = <user_id>;
UPDATE product_views SET user_id = NULL WHERE user_id = <user_id>;
UPDATE cart_events SET user_id = NULL WHERE user_id = <user_id>;
UPDATE cart_snapshots SET user_id = NULL WHERE user_id = <user_id>;
UPDATE checkout_events SET user_id = NULL WHERE user_id = <user_id>;
```

---

## Performance Considerations

### Index Strategy
- All foreign keys are indexed
- Time-based queries have indexes on timestamp columns
- Session lookups use `session_id` index (UNIQUE)
- Composite indexes for common query patterns

### Query Optimization
- Use `session_id` for session-based aggregations
- Filter by date ranges to leverage timestamp indexes
- Use `is_abandoned` index for abandonment queries
- JSONB indexes can be added to `cart_items` if needed

---

## Monitoring & Maintenance

### Check Classification Job Status
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'classify-abandoned-carts-daily')
ORDER BY start_time DESC 
LIMIT 10;
```

### View Recent Classification Results
```sql
SELECT * FROM abandoned_cart_classification_logs
ORDER BY run_at DESC
LIMIT 10;
```

### Manual Classification (Testing)
```sql
SELECT * FROM classify_abandoned_carts();
```

### Check Active Sessions
```sql
SELECT COUNT(*) as active_sessions 
FROM user_sessions 
WHERE is_active = TRUE;
```

### Find Long-Running Sessions
```sql
SELECT 
  session_id,
  user_id,
  started_at,
  last_activity_at,
  EXTRACT(EPOCH FROM (NOW() - started_at)) / 3600 as hours_active
FROM user_sessions
WHERE is_active = TRUE
ORDER BY started_at ASC
LIMIT 20;
```

---

## Troubleshooting

### Issue: Classification job not running
**Check:**
```sql
SELECT * FROM cron.job WHERE jobname = 'classify-abandoned-carts-daily';
```

**Fix:** Reschedule if missing
```sql
SELECT cron.schedule('classify-abandoned-carts-daily', '0 2 * * *', 
  $$SELECT classify_abandoned_carts_with_logging()$$);
```

---

### Issue: Too many active sessions
**Check:**
```sql
SELECT COUNT(*) FROM user_sessions WHERE is_active = TRUE;
```

**Fix:** Manually run session cleanup
```sql
SELECT mark_inactive_sessions();
```

---

### Issue: No abandoned carts being marked
**Check:** Verify data exists
```sql
-- Check for cart snapshots
SELECT COUNT(*) FROM cart_snapshots WHERE snapshot_at < NOW() - INTERVAL '24 hours';

-- Check for checkout events
SELECT COUNT(*) FROM checkout_events;
```

**Debug:** Run classification manually and check logs
```sql
SELECT * FROM classify_abandoned_carts();
```

---

## Next Steps

This database schema is now complete and ready for integration with:

1. **Website Event Tracking** (Phase 2)
   - Session management service
   - Event tracking service
   - API routes for event ingestion

2. **Admin Dashboard Analytics** (Phase 4)
   - Analytics questions and queries
   - Visualization components
   - RBAC permissions

See the main implementation plan for details.

