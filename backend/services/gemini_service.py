import google.generativeai as genai
import json
from core.config import settings

class GeminiService:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-3-flash-preview')
        else:
            self.model = None

    async def analyze_log(self, text: str) -> dict:
        if not self.model:
            return self._fallback_analysis(text)

        prompt = f"""
        Analyze the following student mental health journal entry for emotional distress and crisis risk.
        Text: "{text}"
        
        Respond ONLY with a JSON object:
        {{
            "sentiment_score": float (0 to 1, where 1 is highly distressed/negative),
            "crisis_flag": boolean (true if there are signs of immediate self-harm or severe crisis)
        }}
        """
        
        try:
            response = await self.model.generate_content(prompt)
            # Basic cleaning of response text in case of markdown wrapping
            clean_json = response.text.strip().replace("```json", "").replace("```", "")
            return json.loads(clean_json)
        except Exception as e:
            print(f"GeminiService Error: {e}")
            return self._fallback_analysis(text)

    def _fallback_analysis(self, text: str) -> dict:
        # Simple keyword-based fallback
        text_lower = text.lower()
        crisis_keywords = ["suicide", "kill myself", "end it", "hopeless", "hurt myself", "goodbye"]
        is_crisis = any(kw in text_lower for kw in crisis_keywords)
        
        # Crude sentiment score
        distress_keywords = ["sad", "depressed", "stressed", "angry", "lonely", "fail"]
        score = sum(1 for kw in distress_keywords if kw in text_lower) * 0.2
        
        return {
            "sentiment_score": min(score, 1.0),
            "crisis_flag": is_crisis
        }

gemini_service = GeminiService()