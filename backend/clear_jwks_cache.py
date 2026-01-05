#!/usr/bin/env python3
"""
Clear JWKS cache in the backend to force refetch of new RS256 keys.
Run this after switching JWT algorithms.
"""
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.core.auth import get_jwks

    # Clear the LRU cache
    get_jwks.cache_clear()
    print("✓ JWKS cache cleared successfully!")
    print("  The backend will fetch new RS256 keys on the next request.")

except Exception as e:
    print(f"✗ Failed to clear cache: {e}")
    print("  You may need to restart the FastAPI server instead.")
    sys.exit(1)
