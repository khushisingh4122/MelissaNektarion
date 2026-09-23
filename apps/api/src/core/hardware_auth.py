import hmac
import os

from fastapi import Header, HTTPException


async def require_hardware_token(
    x_hardware_token: str | None = Header(default=None),
) -> None:
    expected = os.getenv("HARDWARE_API_TOKEN", "").strip()
    if not expected:
        return
    if not x_hardware_token or not hmac.compare_digest(x_hardware_token, expected):
        raise HTTPException(status_code=401, detail="Invalid hardware device token")
