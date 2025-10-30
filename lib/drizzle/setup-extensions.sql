-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create UUID v7 generation function
-- This function generates time-ordered UUIDs (UUID v7)
CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS uuid
AS $$
DECLARE
  unix_ts_ms bytea;
  uuid_bytes bytea;
BEGIN
  -- Get current timestamp in milliseconds (48 bits)
  unix_ts_ms = substring(int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint) from 3);

  -- Construct UUID v7 (16 bytes total)
  -- 6 bytes: timestamp
  -- 2 bytes: version (4 bits = 0111) + random (12 bits)
  -- 8 bytes: variant (2 bits = 10) + random (62 bits)
  uuid_bytes = 
    unix_ts_ms ||                                                               -- 6 bytes timestamp
    set_byte(gen_random_bytes(2), 0, (get_byte(gen_random_bytes(1), 0) & 15) | 112) || -- version 7 + random
    set_byte(gen_random_bytes(8), 0, (get_byte(gen_random_bytes(1), 0) & 63) | 128);   -- variant 10 + random

  RETURN encode(uuid_bytes, 'hex')::uuid;
END
$$
LANGUAGE plpgsql
VOLATILE;

-- Add comment
COMMENT ON FUNCTION uuid_generate_v7() IS 'Generate UUID v7 (time-ordered UUID)';

-- Test the function
SELECT uuid_generate_v7() as sample_uuid_v7;
