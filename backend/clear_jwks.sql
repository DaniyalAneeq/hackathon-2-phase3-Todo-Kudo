-- Clear existing JWKS keys to allow Better Auth to regenerate with RS256 algorithm
-- This is needed when switching JWT algorithms

TRUNCATE TABLE neon_auth.jwks;

-- Verify the table is empty
SELECT COUNT(*) as remaining_keys FROM neon_auth.jwks;
