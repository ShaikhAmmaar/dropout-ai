import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import pickle
import os

class MLService:
    def __init__(self):
        self.model = None
        self.feature_names = ['attendance_rate', 'gpa', 'financial_stress_score', 'family_support_score']
        self._initialize_model()

    def _initialize_model(self):
        # In a real app, load from disk. Here we train a synthetic one at startup.
        print("MLService: Initializing model with synthetic data...")
        np.random.seed(42)
        n_samples = 1000
        
        data = {
            'attendance_rate': np.random.uniform(20, 100, n_samples),
            'gpa': np.random.uniform(0, 4, n_samples),
            'financial_stress_score': np.random.uniform(0, 1, n_samples),
            'family_support_score': np.random.uniform(0, 1, n_samples)
        }
        df = pd.DataFrame(data)
        
        # Simple rule: High dropout if low attendance, low gpa, high financial stress, low support
        # We calculate a score and threshold it
        risk_score = (
            (100 - df['attendance_rate']) * 0.4 + 
            (4 - df['gpa']) * 10 + 
            df['financial_stress_score'] * 20 + 
            (1 - df['family_support_score']) * 20
        )
        df['dropout'] = (risk_score > 40).astype(int)
        
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(df[self.feature_names], df['dropout'])
        print("MLService: Model training complete.")

    def predict_probability(self, student_data: dict) -> float:
        input_df = pd.DataFrame([student_data])[self.feature_names]
        # predict_proba returns [prob_class_0, prob_class_1]
        prob = self.model.predict_proba(input_df)[0][1]
        return float(prob)

ml_service = MLService()