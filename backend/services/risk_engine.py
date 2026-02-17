from .ml_service import ml_service
from .shap_service import shap_service
from .alert_service import alert_service

class RiskEngine:
    @staticmethod
    def classify_risk(score: float) -> str:
        if score < 0.3: return "Low"
        if score < 0.6: return "Medium"
        if score < 0.8: return "High"
        return "Critical"

    async def assess_student(self, student_data: dict) -> dict:
        # 1. ML Prediction
        score = ml_service.predict_probability(student_data)
        level = self.classify_risk(score)
        
        # 2. SHAP Explanation
        explanation = shap_service.explain(student_data)
        
        # 3. Alert Check
        alert_triggered = level == "Critical"
        alert_msg = None
        if alert_triggered:
            alert_msg = alert_service.trigger_intervention(student_data.get('name', 'Student'))
            
        return {
            "risk_score": score,
            "risk_level": level,
            "shap_values": explanation,
            "alert_triggered": alert_triggered,
            "alert_message": alert_msg
        }

risk_engine = RiskEngine()