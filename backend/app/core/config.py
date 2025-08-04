"""
Application configuration settings using Pydantic Settings.
"""

from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union
import os

class Settings(BaseSettings):
    """Application settings."""
    
    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_KEY: str
    
    # Database Configuration
    DATABASE_URL: str
    
    # Security Configuration
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = [
        "https://aura-asset-manager.vercel.app",
        "https://aura-asset-manager-git-main-cerebral-valley.vercel.app", 
        "https://aura-asset-manager-cerebral-valley.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000"
    ]
    
    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            # Strip whitespace
            v = v.strip()
            
            # Handle JSON array format like '["url1","url2"]'
            if v.startswith('[') and v.endswith(']'):
                import json
                try:
                    parsed = json.loads(v)
                    # Ensure all items are strings and strip whitespace
                    return [str(origin).strip() for origin in parsed]
                except json.JSONDecodeError as e:
                    print(f"Warning: Failed to parse ALLOWED_ORIGINS as JSON: {e}")
                    print(f"Value was: {repr(v)}")
                    # Fallback: try to extract URLs manually
                    import re
                    urls = re.findall(r'"([^"]*)"', v)
                    if urls:
                        return [url.strip() for url in urls]
            
            # Handle comma-separated format like 'url1,url2'
            if ',' in v:
                return [origin.strip() for origin in v.split(',') if origin.strip()]
            
            # Single URL
            if v:
                return [v]
                
        elif isinstance(v, list):
            # Already a list, just strip whitespace from each item
            return [str(origin).strip() for origin in v]
            
        return v
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_BURST: int = 100
    
    # Monitoring
    SENTRY_DSN: str = ""
    LOG_LEVEL: str = "INFO"
    
    # Security Headers
    ENABLE_SECURITY_HEADERS: bool = True
    
    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.ENVIRONMENT.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development."""
        return self.ENVIRONMENT.lower() == "development"

# Create settings instance
settings = Settings()

# Debug: Print CORS configuration on startup
if __name__ == "__main__" or os.getenv("DEBUG_CORS", "false").lower() == "true":
    print(f"CORS Configuration:")
    print(f"  ALLOWED_ORIGINS: {settings.ALLOWED_ORIGINS}")
    print(f"  Type: {type(settings.ALLOWED_ORIGINS)}")
    print(f"  Environment: {settings.ENVIRONMENT}")
    print(f"  Is Production: {settings.is_production}")
