import shap
import pickle
import os
import numpy as np
from .predict import load_model, FEATURE_ORDER

def get_shap_values(features_dict):
    model = load_model()
    if not model:
        # Fallback explanation if model missing
        return {k: 0.0 for k in features_dict.keys()}

    # Prepare data in correct order
    X = np.array([[features_dict[f] for f in ['gpa', 'attendance', 'assignments', 'backlogs']]])
    
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)
    
    # Class 1 (Dropout) impact
    # shap_values[1] is for the positive class
    impacts = shap_values[1][0] if isinstance(shap_values, list) else shap_values[0]
    
    explanation = {
        FEATURE_ORDER[i]: float(impacts[i])
        for i in range(len(FEATURE_ORDER))
    }
    
    return explanation