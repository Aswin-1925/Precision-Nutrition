# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Extra
from typing import Dict, Any
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import os
import traceback

# ---> NEW IMPORT HERE <---
from biological_mapper import generate_clinical_report 

app = FastAPI(title="Precision Nutrition AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Highly permissive for local testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the ML Models on startup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "xgboost_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "models", "standard_scaler.pkl")

try:
    xgb_model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("✅ Models loaded successfully!")
except Exception as e:
    print(f"❌ Error loading models: {e}")

class PatientData(BaseModel):
    features: Dict[str, Any]
    
    class Config:
        extra = "allow"

@app.get("/")
def read_root():
    return {"status": "🧠 AI Precision Nutrition Engine is Online!"}

@app.post("/analyze")
def analyze_patient(data: PatientData):
    try:
        df = pd.DataFrame([data.features])
        
        # Reorder columns to match EXACTLY what the scaler expects
        if hasattr(scaler, 'feature_names_in_'):
            expected_cols = list(scaler.feature_names_in_)
            df = df[expected_cols]
        
        X_scaled = scaler.transform(df)
        
        probability = float(xgb_model.predict_proba(X_scaled)[0][1])
        
        # ---> NEW CLINICAL ENGINE CALL HERE <---
        clinical_report = generate_clinical_report(data.features, probability)
        
        return {
            "dysbiosis_risk_score": round(probability * 100, 2),
            "status": "Unhealthy/Dysbiosis" if probability > 0.5 else "Healthy",
            "clinical_recommendations": clinical_report
        }
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"❌ SERVER CRASH: {str(e)}\n{error_trace}")
        raise HTTPException(status_code=500, detail=str(e))