
# AI-Based Dropout Prediction & Smart Mental Health Crisis Detector

## Phase 5: System Stabilization & Demo Optimization

This platform is an enterprise-grade SaaS solution designed for educational institutions to proactively identify students at risk of dropping out and detect mental health crises through a combination of traditional academic metrics and AI-driven emotional analysis.

---

## 1. System Architecture
The application follows a modular "Service-Oriented" frontend architecture:
- **Core Layer**: `App.tsx` handles Routing and Auth simulation.
- **Service Layer**: 
  - `mlService.ts`: Core "Random Forest" inspired predictive logic (Risk, SHAP, Anomaly, Sensitivity).
  - `geminiService.ts`: Integration with Google Gemini API for NLP tasks (Emotion, Interventions).
  - `riskEngine.ts`: Aggregator that combines ML and LLM outputs into a unified Risk Report.
  - `db.ts`: LocalStorage-based persistent data layer for demo environments.
- **UI Layer**: Tailwind CSS components and Recharts for data visualization.

---

## 2. System Flow (Logic Diagram)
1. **Data Input**: Student data (academic/behavioral) + Student Journal text.
2. **Analysis Pipeline**:
   - **Step A (ML)**: Academic data passed to `predictRiskAdvanced`. Returns Risk %, SHAP values, and Anomaly flags.
   - **Step B (LLM)**: Journal text passed to Gemini. Returns Emotional State, Distress Score, and Crisis Flag.
   - **Step C (Fusion)**: `riskEngine` aggregates scores. If `crisis_flag` is true, an **Alert** is dispatched to the institution.
3. **Storage**: Data is persisted to the mock DB.
4. **Visualization**: Admin/Student dashboards render the history, explanations, and recovery plans.

---

## 3. API & Service Mapping (Internal)
| Endpoint (Service) | Method | Purpose | Access |
| :--- | :--- | :--- | :--- |
| `calculateSaaSRisk` | Internal | Aggregates all AI logic into a report | System |
| `predictRiskAdvanced` | Internal | ML-based probability & SHAP | Enterprise |
| `analyzeEmotionalState` | POST/API | LLM-based sentiment & crisis check | Pro/Enterprise |
| `getStudents(instId)` | GET | Fetches all students for an institution | Admin/Counselor |
| `getAlerts(instId)` | GET | Fetches real-time crisis/anomaly alerts | Admin/Counselor |
| `saveStudent(data)` | POST | Updates student profile & history | System |

---

## 4. Environment Variables
To run this application, the following environment variable is required:
- `process.env.API_KEY`: A valid Google Gemini API Key.

---

## 5. Deployment Instructions
### Frontend (Vercel/Netlify)
1. Fork/Clone the repository.
2. Set the `API_KEY` environment variable in your provider's dashboard.
3. Build Command: `npm run build` (or equivalent).
4. Output Directory: `dist` or `build`.

### Backend (Future Expansion to Render/FastAPI)
- The logic is currently client-side for demo speed, but service files are structured to be easily ported to a Python FastAPI backend.

---

## 6. Demo Mode Personas
- **Admin (Enterprise)**: `admin@apex.edu` (Full transparency, SHAP, Bias reports).
- **Admin (Basic)**: `admin@cc.edu` (Restricted features, only basic risk).
- **Student**: `maria@apex.edu` (View personal risk and history).
