"""
Standalone AI client for Hunt-X (no external dependencies)
Replaces company_config imports
"""

import os
import requests

OLLAMA_API_KEY = os.getenv('OLLAMA_API_KEY', '')
OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL', 'https://api.ollama.ai/v1')

def kimi_query(prompt: str, system: str = "You are a helpful assistant.") -> str:
    """Query Ollama/Kimi API for AI responses"""
    try:
        headers = {
            'Authorization': f'Bearer {OLLAMA_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'model': 'kimi-k2.5',
            'messages': [
                {'role': 'system', 'content': system},
                {'role': 'user', 'content': prompt}
            ],
            'stream': False
        }
        
        response = requests.post(
            f'{OLLAMA_BASE_URL}/chat/completions',
            headers=headers,
            json=data,
            timeout=120
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get('choices', [{}])[0].get('message', {}).get('content', 'No response')
        else:
            return f"API Error: {response.status_code}"
            
    except Exception as e:
        return f"Error: {str(e)}"

def notify(message: str):
    """Notification stub - could integrate with Telegram later"""
    print(f"[NOTIFY] {message}")
