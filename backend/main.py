"""
Aura Asset Manager - FastAPI Backend Application
Simplified version for initial deployment
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI application instance
app = FastAPI(
    title="Aura Asset Manager API",
    description="Backend API for the Aura Personal Asset Manager",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS - simplified for deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Will update after frontend deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {"message": "Aura Asset Manager API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/api/v1/test")
async def test_endpoint():
    """Test endpoint to verify API is working."""
    return {"message": "API test successful", "environment": os.getenv("ENVIRONMENT", "production")}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=False
    )
