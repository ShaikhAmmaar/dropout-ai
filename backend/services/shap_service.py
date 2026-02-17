import shap
import pandas as pd
from .ml_service import ml_service

class SHAPService:
    def __init__(self):
        self.explainer = shap.TreeExplainer(ml_service.model)

    def explain(self, student_data: dict) -> dict:
        input_df = pd.DataFrame([student_data])[ml_service.feature_names]
        shap_values = self.explainer.shap_values(input_df)
        
        # shap_values can be a list for multi-class or array for binary
        # We want the values for class 1 (dropout)
        if isinstance(shap_values, list):
            vals = shap_values[1][0]
        else:
            # For modern SHAP versions with TreeExplainer on binary RF
            vals = shap_values[0, :, 1] if len(shap_values.shape) == 3 else shap_values[0]

        explanation = {
            ml_service.feature_names[i]: float(vals[i])
            for i in range(len(ml_service.feature_names))
        }
        return explanation

shap_service = SHAPService()