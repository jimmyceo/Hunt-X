"""
AI Client module
Re-exports from ai_client for backward compatibility
"""

from ai_client import AIClient, ai_query, ai_query_json, get_model_usage_stats, reset_model_usage_stats

__all__ = [
    "AIClient",
    "ai_query",
    "ai_query_json",
    "get_model_usage_stats",
    "reset_model_usage_stats"
]