#!/usr/bin/env python
"""Start chatbot server with proper logging"""
import sys
import logging

# Setup logging to file
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

logger.info("Starting chatbot server...")

try:
    logger.info("Importing FastAPI...")
    import uvicorn
    from app.main import app

    logger.info("Starting Uvicorn...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        access_log=True,
    )
except Exception as e:
    logger.error(f"Failed to start server: {type(e).__name__}: {e}", exc_info=True)
    sys.exit(1)
