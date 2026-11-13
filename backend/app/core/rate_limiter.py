import time
from collections import defaultdict
from fastapi import Request, HTTPException, status

class InMemoryRateLimiter:
    """
    Sliding window in-memory rate limiter to protect authentication endpoints
    against brute-force attacks, credential stuffing, and registration spam.
    """
    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)

    def check_rate_limit(self, request: Request, identifier: str = None):
        # Identify by custom identifier (e.g. email) or client IP address
        client_ip = request.client.host if request.client else "unknown"
        key = f"{client_ip}_{identifier}" if identifier else client_ip
        
        now = time.time()
        # Filter out timestamps outside the sliding window
        self.requests[key] = [ts for ts in self.requests[key] if now - ts < self.window_seconds]

        if len(self.requests[key]) >= self.max_requests:
            oldest = self.requests[key][0]
            retry_after = int(self.window_seconds - (now - oldest))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Security alert: Too many requests. Please wait {max(retry_after, 1)} seconds before trying again.",
                headers={"Retry-After": str(max(retry_after, 1))}
            )

        self.requests[key].append(now)

# Instantiate rate limiters
auth_rate_limiter = InMemoryRateLimiter(max_requests=15, window_seconds=60)
