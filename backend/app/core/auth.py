"""
JWT token verification for Better Auth integration.

This module handles stateless JWT verification for the backend API.
Tokens are issued by Better Auth on the frontend and verified here using JWKS.
"""

from jose import jwt
from jose.exceptions import JWTError, JWKError
from typing import Dict, Any, Optional
import httpx
from functools import lru_cache
from app.core.config import settings


@lru_cache(maxsize=1)
def get_jwks() -> Dict[str, Any]:
    """
    Fetch JWKS (JSON Web Key Set) from Better Auth server.
    Results are cached to avoid repeated network calls.

    Returns:
        JWKS dictionary containing public keys

    Raises:
        Exception: If JWKS fetch fails
    """
    jwks_url = f"{settings.BETTER_AUTH_URL}/api/auth/jwks"
    try:
        response = httpx.get(jwks_url, timeout=5.0)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise Exception(f"Failed to fetch JWKS: {str(e)}")


def verify_jwt_token(token: str) -> Optional[str]:
    """
    Verify JWT token using JWKS and extract user_id claim.

    Args:
        token: JWT token from Better Auth

    Returns:
        user_id if token is valid, None otherwise

    Raises:
        JWTError: If token is invalid, expired, or signature verification fails
    """
    try:
        print(f"[DEBUG] Verifying token: {token[:50]}...")

        # Get JWKS from Better Auth server
        jwks = get_jwks()
        print(f"[DEBUG] JWKS fetched: {jwks}")

        # Decode token header to get the key ID (kid)
        unverified_header = jwt.get_unverified_header(token)
        print(f"[DEBUG] Token header: {unverified_header}")
        kid = unverified_header.get("kid")

        if not kid:
            raise JWTError("Token missing 'kid' in header")

        # Find the matching key in JWKS
        matching_key = None
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                matching_key = key
                break

        if not matching_key:
            raise JWTError(f"No matching key found for kid: {kid}")

        print(f"[DEBUG] Matching key found: {matching_key}")

        # Verify and decode the JWT using the public key from JWKS
        payload: Dict[str, Any] = jwt.decode(
            token,
            matching_key,
            algorithms=["RS256", "PS256", "ES256"],  # RS256 is primary; python-jose does NOT support EdDSA
            audience=settings.BETTER_AUTH_URL,
            issuer=settings.BETTER_AUTH_URL,
        )

        print(f"[DEBUG] Token payload: {payload}")

        # Extract user_id from token payload
        # Better Auth stores user ID in the 'sub' (subject) claim
        user_id: Optional[str] = payload.get("sub")

        if not user_id:
            raise JWTError("Missing user_id in token payload")

        print(f"[DEBUG] User ID extracted: {user_id}")
        return user_id

    except (JWTError, JWKError) as e:
        # Re-raise JWT/JWK errors (expired, invalid signature, etc.)
        print(f"[ERROR] Token verification failed: {str(e)}")
        raise JWTError(f"Token verification failed: {str(e)}")
