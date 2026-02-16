"""
Logging Configuration
Structured logging setup with JSON formatting and multiple handlers
"""

import logging
import logging.config
import sys
from typing import Dict, Any
from pathlib import Path

import structlog
from structlog.stdlib import LoggerFactory

from app.core.config import settings


def setup_logging() -> None:
    """Configure application logging with structured logging support"""
    
    # Create logs directory
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Logging configuration
    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "standard": {
                "format": settings.LOG_FORMAT,
                "datefmt": "%Y-%m-%d %H:%M:%S"
            },
            "json": {
                "()": "structlog.stdlib.ProcessorFormatter",
                "processor": structlog.dev.ConsoleRenderer(colors=False),
                "foreign_pre_chain": [
                    structlog.contextvars.merge_contextvars,
                    structlog.processors.TimeStamper(fmt="iso"),
                    structlog.stdlib.add_logger_name,
                    structlog.stdlib.add_log_level,
                    structlog.stdlib.PositionalArgumentsFormatter(),
                ],
            },
            "colored": {
                "()": "structlog.stdlib.ProcessorFormatter",
                "processor": structlog.dev.ConsoleRenderer(colors=True),
                "foreign_pre_chain": [
                    structlog.contextvars.merge_contextvars,
                    structlog.processors.TimeStamper(fmt="iso"),
                    structlog.stdlib.add_logger_name,
                    structlog.stdlib.add_log_level,
                    structlog.stdlib.PositionalArgumentsFormatter(),
                ],
            }
        },
        "handlers": {
            "console": {
                "level": settings.LOG_LEVEL,
                "class": "logging.StreamHandler",
                "formatter": "colored" if settings.DEBUG else "json",
                "stream": sys.stdout
            },
            "file": {
                "level": "INFO",
                "class": "logging.handlers.RotatingFileHandler",
                "filename": "logs/architectai.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
                "formatter": "json"
            },
            "error_file": {
                "level": "ERROR",
                "class": "logging.handlers.RotatingFileHandler",
                "filename": "logs/error.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
                "formatter": "json"
            }
        },
        "loggers": {
            "": {  # Root logger
                "level": settings.LOG_LEVEL,
                "handlers": ["console", "file"],
                "propagate": False
            },
            "app": {
                "level": settings.LOG_LEVEL,
                "handlers": ["console", "file", "error_file"],
                "propagate": False
            },
            "uvicorn": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False
            },
            "uvicorn.access": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False
            },
            "sqlalchemy.engine": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False
            },
            "boto3": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False
            },
            "botocore": {
                "level": "WARNING", 
                "handlers": ["console"],
                "propagate": False
            }
        }
    }
    
    # Apply logging configuration
    logging.config.dictConfig(logging_config)
    
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        context_class=dict,
        logger_factory=LoggerFactory(),
        cache_logger_on_first_use=True,
    )


class ArchitectAILogger:
    """Custom logger class with additional context and methods"""
    
    def __init__(self, name: str):
        self.logger = structlog.get_logger(name)
    
    def info(self, message: str, **kwargs):
        """Log info message with context"""
        self.logger.info(message, **kwargs)
    
    def error(self, message: str, **kwargs):
        """Log error message with context"""
        self.logger.error(message, **kwargs)
    
    def warning(self, message: str, **kwargs):
        """Log warning message with context"""
        self.logger.warning(message, **kwargs)
    
    def debug(self, message: str, **kwargs):
        """Log debug message with context"""
        self.logger.debug(message, **kwargs)
    
    def nova_request(self, model: str, operation: str, tokens: int, **kwargs):
        """Log Nova API request"""
        self.logger.info(
            "Nova API request",
            model=model,
            operation=operation,
            tokens=tokens,
            **kwargs
        )
    
    def nova_response(self, model: str, operation: str, success: bool, 
                     response_time_ms: float, **kwargs):
        """Log Nova API response"""
        self.logger.info(
            "Nova API response",
            model=model,
            operation=operation,
            success=success,
            response_time_ms=response_time_ms,
            **kwargs
        )
    
    def architecture_generation(self, user_id: str, requirements: str, 
                              success: bool, processing_time_ms: float, **kwargs):
        """Log architecture generation event"""
        self.logger.info(
            "Architecture generation",
            user_id=user_id,
            requirements_length=len(requirements),
            success=success,
            processing_time_ms=processing_time_ms,
            **kwargs
        )
    
    def cost_calculation(self, architecture_id: str, total_cost: float, 
                        components_count: int, **kwargs):
        """Log cost calculation event"""
        self.logger.info(
            "Cost calculation",
            architecture_id=architecture_id,
            total_cost=total_cost,
            components_count=components_count,
            **kwargs
        )
    
    def user_action(self, user_id: str, action: str, resource_id: str = None, **kwargs):
        """Log user action"""
        self.logger.info(
            "User action",
            user_id=user_id,
            action=action,
            resource_id=resource_id,
            **kwargs
        )


def get_logger(name: str) -> ArchitectAILogger:
    """Get application logger with name"""
    return ArchitectAILogger(name)


class LoggingMiddleware:
    """Middleware for request/response logging"""
    
    def __init__(self, logger_name: str = "app.middleware"):
        self.logger = get_logger(logger_name)
    
    async def log_request(self, request, call_next):
        """Log request details"""
        import time
        
        start_time = time.time()
        
        # Log request
        self.logger.info(
            "Incoming request",
            method=request.method,
            url=str(request.url),
            user_agent=request.headers.get("user-agent"),
            client_ip=request.client.host if request.client else None
        )
        
        # Process request
        response = await call_next(request)
        
        # Log response
        process_time = (time.time() - start_time) * 1000
        
        self.logger.info(
            "Request completed",
            method=request.method,
            url=str(request.url),
            status_code=response.status_code,
            processing_time_ms=round(process_time, 2)
        )
        
        return response


class SecurityLogger:
    """Logger for security-related events"""
    
    def __init__(self):
        self.logger = get_logger("app.security")
    
    def login_attempt(self, email: str, success: bool, ip_address: str = None):
        """Log login attempt"""
        self.logger.info(
            "Login attempt",
            email=email,
            success=success,
            ip_address=ip_address
        )
    
    def unauthorized_access(self, endpoint: str, ip_address: str = None):
        """Log unauthorized access attempt"""
        self.logger.warning(
            "Unauthorized access attempt",
            endpoint=endpoint,
            ip_address=ip_address
        )
    
    def rate_limit_exceeded(self, ip_address: str, endpoint: str):
        """Log rate limit exceeded"""
        self.logger.warning(
            "Rate limit exceeded",
            ip_address=ip_address,
            endpoint=endpoint
        )


class PerformanceLogger:
    """Logger for performance monitoring"""
    
    def __init__(self):
        self.logger = get_logger("app.performance")
    
    def slow_query(self, query: str, execution_time_ms: float, threshold_ms: float = 1000):
        """Log slow database queries"""
        if execution_time_ms > threshold_ms:
            self.logger.warning(
                "Slow database query",
                query=query[:200] + "..." if len(query) > 200 else query,
                execution_time_ms=execution_time_ms,
                threshold_ms=threshold_ms
            )
    
    def memory_usage(self, usage_mb: float, threshold_mb: float = 500):
        """Log high memory usage"""
        if usage_mb > threshold_mb:
            self.logger.warning(
                "High memory usage",
                usage_mb=usage_mb,
                threshold_mb=threshold_mb
            )
    
    def api_performance(self, endpoint: str, method: str, response_time_ms: float,
                       status_code: int):
        """Log API performance metrics"""
        log_level = "warning" if response_time_ms > 5000 else "info"
        
        self.logger.log(
            log_level,
            "API performance",
            endpoint=endpoint,
            method=method,
            response_time_ms=response_time_ms,
            status_code=status_code
        )


# Initialize loggers
setup_logging()

# Export common loggers
app_logger = get_logger("app")
security_logger = SecurityLogger()
performance_logger = PerformanceLogger()

__all__ = [
    "setup_logging",
    "get_logger",
    "ArchitectAILogger",
    "LoggingMiddleware",
    "SecurityLogger",
    "PerformanceLogger",
    "app_logger",
    "security_logger", 
    "performance_logger"
]
