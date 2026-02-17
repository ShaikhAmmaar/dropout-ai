import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import pickle
import os

def train_initial_model():
    # Create dummy dataset
    np.random.seed(42)
    n_samples = 1000
    
    data = {
        'gpa': np.random.uniform(0, 4.0, n_samples),
        'attendance': np.random.uniform(20, 100, n_samples),
        'assignments': np.random.uniform(0, 100, n_samples),
        'backlogs': np.random.randint(0, 10, n_samples)
    }
    
    df = pd.DataFrame(data)
    
    # Simple rule for labels
    # Dropout = 1 if (Attendance < 60 and Assignments < 50) or (Backlogs > 5)
    df['dropout'] = ((df['attendance'] < 60) & (df['assignments'] < 50) | (df['backlogs'] > 5)).astype(int)
    
    X = df[['gpa', 'attendance', 'assignments', 'backlogs']]
    y = df['dropout']
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
        
    print(f"Model trained and saved to {model_path}")

if __name__ == "__main__":
    train_initial_model()