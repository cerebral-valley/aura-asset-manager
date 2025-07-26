"""
Security middleware for production deployment.
"""

from fastapi import FastAPI, Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.sessions import SessionMiddleware
import time
import logging
from collections import defaultdict
from datetime import datetime, timedelta
from app.core.config import settings

logger = logging.getLogger(__name__)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        if settings.ENABLE_SECURITY_HEADERS:
            # Security headers for production
            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
            response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
            
            if settings.is_production:
                # Strict Transport Security for HTTPS
                response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
                # Content Security Policy
                response.headers["Content-Security-Policy"] = (
                    "default-src 'self'; "
                    "script-src 'self' 'unsafe-inline'; "
                    "style-src 'self' 'unsafe-inline'; "
                    "img-src 'self' data: https:; "
                    "connect-src 'self' https://*.supabase.co; "
                    "frame-ancestors 'none';"
                )
        
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple rate limiting middleware."""
    
    def __init__(self, app, calls: int = 60, period: timedelta = timedelta(minutes=1)):
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.clients = defaultdict(list)
    
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        now = datetime.now()
        
        # Clean old entries
        self.clients[client_ip] = [
            timestamp for timestamp in self.clients[client_ip]
            if now - timestamp < self.period
        ]
        
        # Check rate limit
        if len(self.clients[client_ip]) >= self.calls:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later."
            )
        
        # Add current request
        self.clients[client_ip].append(now)
        
        response = await call_next(request)
        return response

class LoggingMiddleware(BaseHTTPMiddleware):
    """Log all requests for monitoring."""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request
        logger.info(
            f"Request: {request.method} {request.url.path} "
            f"from {request.client.host}"
        )
        
        response = await call_next(request)
        
        # Log response
        process_time = time.time() - start_time
        logger.info(
            f"Response: {response.status_code} "
            f"in {process_time:.4f}s"
        )
        
        return response

def setup_security_middleware(app: FastAPI):
    """Set up all security middleware for the application."""
    
    # Session middleware (if needed)
    app.add_middleware(
        SessionMiddleware,
        secret_key=settings.SECRET_KEY,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        https_only=settings.is_production,
        same_site="strict" if settings.is_production else "lax"
    )
    
    # Security headers
    app.add_middleware(SecurityHeadersMiddleware)
    
    # Rate limiting (only in production)
    if settings.is_production:
        app.add_middleware(
            RateLimitMiddleware,
            calls=settings.RATE_LIMIT_PER_MINUTE,
            period=timedelta(minutes=1)
        )
    
    # HTTPS redirect (only in production)
    if settings.is_production:
        app.add_middleware(HTTPSRedirectMiddleware)
        
        # Trusted host middleware for production
        allowed_hosts = []
        for origin in settings.ALLOWED_ORIGINS:
            if origin.startswith("https://"):
                host = origin.replace("https://", "").replace("www.", "")
                allowed_hosts.extend([host, f"www.{host}"])
        
        if allowed_hosts:
            app.add_middleware(
                TrustedHostMiddleware,
                allowed_hosts=allowed_hosts
            )
    
    # Request logging
    app.add_middleware(LoggingMiddleware)
    
    logger.info("Security middleware configured successfully")
