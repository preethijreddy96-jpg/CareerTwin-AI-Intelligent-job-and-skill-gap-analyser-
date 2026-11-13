import time
from collections import defaultdict
from fastapi import Request, HTTPException, status

class InMemoryRateLimiter:
    """Simple in-memory rate limiter for authentication routes to protect against brute-force attacks."""
    def __init__(self, max_requests: int = 15, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)

    def check_rate_limit(self, request: Request, identifier: str = None):
        # Identify by IP or provided identifier
        client_ip = identifier or request.client.host if request.client else "unknown"
        now = time.time()
        
        # Clean up old timestamps outside the window
        timestamps = self.requests[client_ip]
        self.requests[client_ip] = [ts for ts in timestamps if now - ts < self.window_seconds]
        
        if len(self.requests[client_ip]) >= self.max_requests:
            retry_after = int(self.window_seconds - (now - self.requests[client_ip][0]))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many authentication attempts. Please wait {max(retry_after, 1)} seconds before trying again.",
                headers={"Retry-After": str(max(retry_after, 1))}
            )
            
        self.requests[client_ip].append(now)

auth_rate_limiter = InMemoryRateLimiter(max_requests=20, window_seconds=60)
