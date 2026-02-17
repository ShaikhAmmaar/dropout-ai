import os
import json
import google.generativeai as genai
from typing import Dict

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def analyze_journal_with_gemini(text: str) -> Dict:
    model = genai.GenerativeModel('gemini-2.5-flash-latest')
    prompt = f"""
    Analyze the following student journal entry:
    "{text}"
    
    Determine the emotional distress level (0-100) and if there is a crisis marker.
    Return ONLY JSON:
    {{
        "emotional_score": float,
        "crisis_flag": boolean,
        "emotional_state": "Normal" | "Stress" | "Crisis" | "Burnout"
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        # Handle potential markdown formatting in response
        clean_text = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_text)
    except Exception as e:
        print(f"Gemini Error: {e}")
        return {
            "emotional_score": 0,
            "crisis_flag": False,
            "emotional_state": "Analysis Failed"
        }