------------------------------------------------------------------------------
-- SEED `locations` (service areas)
-- Run in the Supabase SQL Editor. Idempotent: ON CONFLICT keeps it re-runnable.
--
-- These are the predefined service areas a therapist picks from for "Areas
-- covered" (therapist_locations) and that patient requests reference
-- (requests.location_id). Coordinates are governorate centers; the *_delta
-- values are the map zoom span used by the patient app's map.
------------------------------------------------------------------------------
INSERT INTO locations (location_name, latitude, longitude, latitude_delta, longitude_delta)
VALUES
    ('Cairo',          30.0444, 31.2357, 0.30, 0.30),
    ('Giza',           30.0131, 31.2089, 0.30, 0.30),
    ('Alexandria',     31.2001, 29.9187, 0.30, 0.30),
    ('Qalyubia',       30.4292, 31.2045, 0.25, 0.25),
    ('Port Said',      31.2653, 32.3019, 0.20, 0.20),
    ('Suez',           29.9668, 32.5498, 0.20, 0.20),
    ('Dakahlia',       31.0409, 31.3785, 0.30, 0.30),
    ('Sharqia',        30.7327, 31.7195, 0.30, 0.30),
    ('Gharbia',        30.8754, 31.0335, 0.25, 0.25),
    ('Monufia',        30.5972, 30.9876, 0.25, 0.25),
    ('Beheira',        30.8481, 30.3436, 0.40, 0.40),
    ('Kafr El Sheikh', 31.1107, 30.9388, 0.30, 0.30),
    ('Damietta',       31.4165, 31.8133, 0.20, 0.20),
    ('Ismailia',       30.5965, 32.2715, 0.30, 0.30),
    ('Fayoum',         29.3084, 30.8428, 0.30, 0.30),
    ('Beni Suef',      29.0661, 31.0994, 0.30, 0.30),
    ('Minya',          28.1099, 30.7503, 0.40, 0.40),
    ('Asyut',          27.1809, 31.1837, 0.40, 0.40),
    ('Sohag',          26.5569, 31.6948, 0.40, 0.40),
    ('Qena',           26.1551, 32.7160, 0.40, 0.40),
    ('Luxor',          25.6872, 32.6396, 0.30, 0.30),
    ('Aswan',          24.0889, 32.8998, 0.50, 0.50),
    ('Red Sea',        26.0667, 33.8500, 1.50, 1.50),
    ('New Valley',     25.4477, 30.5582, 2.00, 2.00),
    ('Matrouh',        31.3543, 27.2373, 1.50, 1.50),
    ('North Sinai',    30.2824, 33.6176, 1.00, 1.00),
    ('South Sinai',    28.8765, 33.9734, 1.00, 1.00)
ON CONFLICT (location_name) DO NOTHING;

------------------------------------------------------------------------------
-- DONE. Verify:  SELECT COUNT(*) FROM locations;
------------------------------------------------------------------------------
