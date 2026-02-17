import pickle
import numpy as np
import os

# Feature order: [gpa, attendance, assignment_completion, backlogs]
FEATURE_ORDER = ['gpa', 'attendance', 'assignments', 'backlogs']

def load_model():
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    if os.path.exists(model_path):
        with open(model_path, 'rb') as f:
            return pickle.load(f)
    return None

def predict_student_risk(gpa, attendance, assignments, backlogs):
    model = load_model()
    # Mocking if model not yet trained in demo environment
    if not model:
        # Simple heuristic for demo fallback
        base_risk = (100 - attendance) * 0.4 + (100 - assignments) * 0.3 + (backlogs * 10)
        prob = min(95, max(5, base_risk)) / 100.0
        return prob

    features = np.array([[gpa, attendance, assignments, backlogs]])
    prob = model.predict_proba(features)[0][1]
    return float(prob)