<div align="center">

# 🧬 Presonalized Nutrition AI 
**Clinical-Grade Multi-Omics & Microbiome Reasoning Engine**

[![Live Demo](https://img.shields.io/badge/Live_App-success?style=for-the-badge&logo=vercel)](https://precision-nutrition-mu.vercel.app/)
[![Python Version](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0-F37626?style=for-the-badge&logo=xgboost&logoColor=white)](https://xgboost.ai/)
[![Status](https://img.shields.io/badge/Status-Clinical_Ready-emerald?style=for-the-badge)](#)

*A decoupled microservices platform bridging Machine Learning classification with Biological Ontology to deliver personalized, prescriptive dietetics.*

</div>

---

## 📖 Table of Contents
- [Executive Summary](#-executive-summary)
- [System Architecture](#%EF%B8%8F-system-architecture)
- [Clinical Capabilities](#-clinical-capabilities)
- [The Biological Ontology Engine](#-the-biological-ontology-engine)
- [Technology Stack](#-technology-stack)
- [Directory Structure](#-directory-structure)
- [Local Installation & Quick Start](#-local-installation--quick-start)
- [Application](#-live-application)
- [Author](#-author)

---

## 🔬 Executive Summary
 - Standard nutritional AI often limits itself to binary classification (e.g., "Healthy" vs. "Unhealthy"). **Precision Nutrition AI** transcends this by functioning as a digital clinical dietician. 

- The platform ingests high-dimensional multi-omics datasets (metagenomics, metabolomics, and host phenotypes), computes a Dysbiosis Risk Factor via an XGBoost ML algorithm, and maps the patient's specific metabolic deficiencies to a robust **Clinical Rules Ontology**. The output is a highly personalized, dynamically generated nutritional intervention designed to restore metabolic homeostasis.

---

## ⚙️ System Architecture

The platform utilizes a modern decoupled architecture, ensuring scalability, security, and distinct separation of concerns between the mathematical engine and the clinical presentation layer.

```mermaid
graph LR
    A[Clinical Data .XLSX/.CSV] -->|SheetJS Intake| B(React Frontend)
    B -->|REST API POST| C{FastAPI Backend}
    C -->|Scale Data| D[StandardScaler]
    D -->|Predictive Math| E[XGBoost Model]
    E -->|Probability Score| F{Biological Mapper}
    F -->|Pathogen/SCFA Delta| G[Clinical Ontology]
    G -->|JSON Payload| B
    B -->|Render Dashboard| H((Physician UI))
```
## 🩺 Clinical Capabilities
- Dynamic Patient Intake: Native ingestion of .xlsx and .csv cohort data, instantly parsing cross-sheet clinical records.

- Disease-Contextual Branching: The AI adjusts dietary prescriptions based on the patient's baseline diet (Plant vs. Animal dominant) and exact clinical history (e.g., IBD, Type 2 Diabetes).

- Targeted Metabolite Tracking: Monitors keystone taxa (Akkermansia, Faecalibacterium) and sentinel metabolites (Butyrate, Acetate, Inflammation markers).

- Mathematical Deltas: Computes the exact numerical deficit of biological markers and explicitly targets the gap in the clinical rationale.

---

## 🧠 The Biological Ontology Engine
The backend biological_mapper.py operates on functional medicine principles, evaluating mechanistic pathways rather than raw data points:

- Barrier Integrity: Detects SCFA (Butyrate) deficiencies. Prescribes clinical-grade resistant starches and inulin-rich fibers to repair epithelial tight junctions.

- Mucosal Optimization: Maps Akkermansia degradation to insulin resistance risks, triggering high-dose polyphenol and Omega-3 interventions.

- Endotoxemia Starvation: Identifies bile-tolerant opportunistic pathogens (Bilophila) and restricts specific saturated animal fats or artificial emulsifiers to lower systemic inflammation.

---

## 💻 Technology Stack
Machine Learning & Backend (Python)
- Core API: FastAPI / Uvicorn

- ML Algorithms: XGBoost (Gradient Boosting Decision Trees)

- Data Processing: Pandas, Scikit-Learn (StandardScaler)

- Model Serialization: Joblib

Frontend & Visual Analytics (JavaScript)
- Framework: React.js (Vite)

- Styling: TailwindCSS

- Data Visualization: Recharts

- Clinical Data Parser: SheetJS (xlsx)

- Icons: Lucide-React

---

## 📂 Directory Structure

```text
precision-nutrition-ai/
|
├── api/                             # Python ML Backend
|   ├── main.py                      # FastAPI Server & Data Validation
|   ├── biological_mapper.py         # Clinical Rules Ontology Engine
|   ├── requirements.txt             # Python Dependencies
|   └── models/                      
|       ├── xgboost_model.pkl        # Trained Dysbiosis Classifier
|       └── standard_scaler.pkl      # Feature Normalization Matrix
|
└── client/                          # React Frontend Portal
    ├── src/
    |   ├── App.jsx                  # Main Clinical Dashboard UI
    |   ├── index.css                # Tailwind Directives
    |   └── main.jsx                 # React Entry Point
    ├── package.json                 # Node Dependencies
    ├── tailwind.config.js           # UI Theme Configuration
    └── vite.config.js               # Build Tooling
```
---

## 🚀 Local Installation & Quick Start
1.Initialize the AI Engine (Backend)
Navigate to the API directory, install dependencies, and boot the FastAPI server.
```text
Bash
cd api
pip install -r requirements.txt
uvicorn main:app --reload
```
The engine will load the .pkl models into memory and expose http://localhost:8000/analyze.

2.Initialize the Clinical Portal (Frontend)
Open a separate terminal instance, install Node dependencies, and start the Vite development server.
```text
Bash
cd client
npm install
npm run dev
```
3.Run a Clinical Simulation
Open the local application in your browser (typically http://localhost:5173).

- Upload the Clinical_Cohort_Mapped_Data.xlsx file via the Data Intake module.

- Select any de-identified patient record from the dropdown.

- Click Run AI to generate a bespoke, dynamically reasoned clinical nutrition report.

---

## 🌐 Live Application
The platform has been fully deployed and is accessible live. You can test the application directly using the link below:

👉 **[Access the Precision Nutrition App Here](https://precision-nutrition-mu.vercel.app/)**

---

## 👨‍💻 Author

<div align="center">
  <p><b>Architected & Developed by</b></p>
  <h3>Aswin vs</h3>
  <p><i>B.Tech Biotechnology, Karunya Institute of Technology and Sciences</i></p>
  
  <br />

  [![GitHub](https://img.shields.io/badge/GitHub-Aswin--1925-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Aswin-1925)
</div>

```text
Personalized Nutrition Platform (Full-Stack Operational Flow)
│
├── [STAGE 1] Client Intake & Local Parsing (React - Vercel)
│   ├── User uploads "Clinical_Cohort_Mapped_Data.xlsx" 
│   ├── Browser uses SheetJS (xlsx.js) to parse Excel sheets locally
│   ├── UI displays cohort metrics (e.g., "866 Patients Detected")
│   └── User selects a de-identified Patient Profile (e.g., "Record #0") from dropdown
│
├── [STAGE 2] Handshake & Payload Transmission (HTTP POST)
│   ├── User clicks "Run AI" button
│   ├── React compiles the selected patient's 68-feature multi-omics vector
│   └── Sends async HTTP POST request payload to:
│       └── [https://presonalized-nutrition.onrender.com/analyze](https://presonalized-nutrition.onrender.com/analyze)
│
├── [STAGE 3] Machine Learning Pipeline (FastAPI - Render)
│   ├── Endpoint (/analyze) receives JSON payload containing 68-feature vector
│   ├── Data validation check (fails with 422 if vector size != 68)
│   ├── Data Normalization (standard_scaler.pkl)
│   │   └── Transforms raw metrics to standard normal scale (mean=0, variance=1)
│   └── Risk Inference Engine (xgboost_model.pkl)
│       └── Predicts binary class (0/1) & calculates exact Dysbiosis Risk Probability
│
├── [STAGE 4] Clinical Rules Ontology Execution (biological_mapper.py)
│   ├── Evaluates biological marker levels against healthy cohort baselines:
│   │   ├── Keystone Taxa (Bifidobacterium, Akkermansia, Faecalibacterium)
│   │   ├── Metabolic/SCFA profiles (Butyrate, Acetate)
│   │   └── Host Inflammation Markers (CRP, Calprotectin)
│   ├── Maps identified biological deficits to prescriptive medical ontology
│   └── Generates dynamic, clinical-grade dietary recommendations:
│       ├── Barrier Integrity (Restoring Butyrate via resistant starches)
│       ├── Mucosal Layer (Upregulating Akkermansia via targeted polyphenols)
│       └── Systemic Inflammation (Restricting bile-tolerant pathogen fuel)
│
├── [STAGE 5] Secure JSON Response Packaging
│   ├── Combines ML Probability Score with Rule Engine recommendations
│   └── Emits CORS-approved structured JSON response payload back to client
│
└── [STAGE 6] Dynamic Clinical Dashboard Rendering (React - Vercel)
    ├── Receives JSON package in under 100ms
    ├── Renders multi-tiered visualization dashboard:
    │   ├── Gauge Indicator (Calculated Dysbiosis Risk %)
    │   ├── Biomarker Delta charts (Targeted vs. Actual levels)
    │   └── Prescriptive Action Cards (Detailed therapeutic food recommendations)
    └── Dashboard locks in UI, ready for physician interpretation
```
