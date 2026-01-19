from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
from typing import Any, Dict

from src.entities.system_error import SystemError

SECRET = os.getenv("AUTH_SECRET", "dev-secret-change-me")
TOKEN_TTL_SECONDS = int(os.getenv("AUTH_TTL_SECONDS", "86400"))

def _b64url_encode(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).decode("utf-8").rstrip("=")

def _b64url_decode(s: str) -> bytes:
    pad = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode((s + pad).encode("utf-8"))

def mint_token(*, name: str) -> str:
    now = int(time.time())
    payload = {"name": name, "iat": now, "exp": now + TOKEN_TTL_SECONDS}
    payload_b = json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    payload_s = _b64url_encode(payload_b)

    sig = hmac.new(SECRET.encode("utf-8"), payload_s.encode("utf-8"), hashlib.sha256).digest()
    sig_s = _b64url_encode(sig)
    return f"{payload_s}.{sig_s}"

def verify_token(token: str) -> Dict[str, Any]:
    try:
        payload_s, sig_s = token.split(".", 1)
    except ValueError:
        raise SystemError(401, "Invalid token")

    expected_sig = hmac.new(SECRET.encode("utf-8"), payload_s.encode("utf-8"), hashlib.sha256).digest()
    if not hmac.compare_digest(_b64url_encode(expected_sig), sig_s):
        raise SystemError(401, "Invalid token signature")

    payload = json.loads(_b64url_decode(payload_s).decode("utf-8"))
    now = int(time.time())
    if int(payload.get("exp", 0)) < now:
        raise SystemError(401, "Token expired")

    return payload
