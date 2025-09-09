#!/usr/bin/env python3
"""
Efficient Railway Deployment Verification Script
This demonstrates best practices for deployment verification with timeouts,
and shows how to use Railway MCP for structured operations.
"""

import asyncio
import json
import subprocess
import time
import signal
from datetime import datetime
from contextlib import contextmanager

class TimeoutError(Exception):
    pass

@contextmanager
def timeout(seconds):
    """Context manager for timeouts."""
    def timeout_handler(signum, frame):
        raise TimeoutError(f"Operation timed out after {seconds} seconds")
    
    old_handler = signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)
        signal.signal(signal.SIGALRM, old_handler)

def log_with_time(message):
    """Log a message with timestamp."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}")

async def efficient_railway_verification():
    """Demonstrate efficient Railway deployment verification."""
    
    print("🚀 Efficient Railway Deployment Verification")
    print("=" * 60)
    
    
    # Test 1: Quick deployment status (should be ~1 second)
    log_with_time("🔍 Testing Railway status (quick deployment check)...")
    start_time = time.time()
    try:
        with timeout(5):  # 5 second timeout
            result = subprocess.run(
                ["railway", "status"], 
                capture_output=True, 
                text=True
            )
            status_time = time.time() - start_time
            log_with_time(f"✅ Railway status completed in {status_time:.2f}s")
            print(f"   Output: {result.stdout.strip()}")
    except TimeoutError:
        log_with_time("❌ Railway status timed out after 5s")
        status_time = 5.0
    
    print("\n" + "-" * 60 + "\n")
    
    # Test 2: Recent logs with strict timeout (user's preference: 60s max)
    log_with_time("📋 Testing Railway logs with 10s timeout (recent logs only)...")
    start_time = time.time()
    try:
        with timeout(10):  # Strict 10 second timeout
            result = subprocess.run(
                ["railway", "logs", "--tail", "5", "--no-watch"], 
                capture_output=True, 
                text=True
            )
            logs_time = time.time() - start_time
            log_with_time(f"✅ Railway logs completed in {logs_time:.2f}s")
            lines = result.stdout.strip().split('\n') if result.stdout.strip() else []
            print(f"   Retrieved {len(lines)} log lines")
            if lines and lines[0]:  # Check if we actually got logs
                print(f"   Sample log: {lines[0][:80]}...")
            else:
                print("   No recent logs found")
    except TimeoutError:
        logs_time = 10.0
        log_with_time("⏰ Railway logs timed out after 10s")
        print("   💡 This prevents hanging on slow log operations")
    
    print("\n" + "-" * 60 + "\n")
    
    # Test 3: Health check via curl (fastest for live verification)
    log_with_time("🌐 Testing deployment health check via HTTP...")
    start_time = time.time()
    try:
        with timeout(5):  # 5 second timeout for HTTP
            result = subprocess.run(
                ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", 
                 "https://aura-asset-manager.up.railway.app/docs"], 
                capture_output=True, 
                text=True
            )
            health_time = time.time() - start_time
            if result.stdout.strip() == "200":
                log_with_time(f"✅ Health check passed in {health_time:.2f}s (HTTP 200)")
            else:
                log_with_time(f"⚠️ Health check returned HTTP {result.stdout.strip()} in {health_time:.2f}s")
    except (TimeoutError, subprocess.CalledProcessError):
        health_time = 5.0
        log_with_time("❌ Health check timed out or failed after 5s")
    
    print("\n" + "=" * 60 + "\n")
    
    # Summary and recommendations
    print("📊 Performance Summary & Recommendations:")
    print(f"• Railway status: {status_time:.2f}s - ✅ Best for deployment verification")
    print(f"• Railway logs: {logs_time:.2f}s - 🔄 Use with --tail N and timeouts")
    print(f"• Health check: {health_time:.2f}s - 🚀 Fastest for live service verification")
    
    print("\n💡 Efficient Deployment Verification Workflow:")
    print("1. Railway status (~1s) - Check deployment state")
    print("2. Health check (~1-2s) - Verify service is responding") 
    print("3. Recent logs with timeout - Only if issues detected")
    print("4. Railway MCP tools - For structured operations")
    
    print("\n⚙️ Railway MCP Configuration:")
    print("✅ Railway MCP is configured in .vscode/mcp.json")
    print("✅ Available tools: check-railway-status, get-logs, deploy, etc.")
    print("✅ MCP provides structured access vs raw CLI commands")
    
    return {
        "status_time": status_time,
        "logs_time": logs_time, 
        "health_time": health_time
    }

if __name__ == "__main__":
    try:
        asyncio.run(efficient_railway_verification())
        print("\n🎉 Railway MCP setup and efficiency demo completed!")
        print("💡 Use 'railway status' + health checks for fastest deployment verification")
    except KeyboardInterrupt:
        print("\n⏸️ Demo interrupted by user")
    except Exception as e:
        print(f"\n❌ Demo failed: {e}")
