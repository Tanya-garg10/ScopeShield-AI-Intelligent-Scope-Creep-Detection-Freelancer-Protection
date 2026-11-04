# ScopeShield AI 🛡️

**AI Scope Creep Protection & Change Request Generator for Freelancers**  
*Hacktoberfest 2026 Open-Source AI Challenge — Week 2: Side Hustle Winner Track*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Model: Qwen3 4B Instruct](https://img.shields.io/badge/Model-Qwen3%204B%20Instruct%20(Apache%202.0)-violet)](https://ollama.com/library/qwen3)
[![Local AI: Ollama](https://img.shields.io/badge/Local%20AI-Ollama%2011434-teal)](https://ollama.com)

---

## The Problem
Freelancers often agree to fixed-price projects only to watch profit margins evaporate under "small follow-up requests":
- *"Could you also add a payment gateway?"*
- *"Can we just include three more pages?"*
- *"One last round of revisions, please. We assumed this was included."*

Each addition sounds minor in isolation, but together they turn profitable client engagements into dozens of hours of unpaid labor.

**ScopeShield AI** solves this by:
1. Converting unstructured client briefs into binding, clear project scopes.
2. Comparing incoming messages (email, Slack, WhatsApp) against signed contractual boundaries.
3. Classifying scope additions (`Likely in scope`, `Potential scope change`, `Needs human review`) with direct contract evidence.
4. Calculating fair effort and fee addendums based on your hourly rate.
5. Generating courteous, client-ready Change Orders and approval messages.

---

## Why Open-Weight Local AI?
- **Privacy by Design**: Client briefs, rates, and confidential communications run locally on your own machine. Zero cloud telemetry.
- **Zero API Invoices**: Avoids per-token billing from proprietary closed-source providers.
- **Open Innovation**: Built for **Qwen3 4B Instruct** running through Ollama under the Apache 2.0 license.

---

## Official Demo Scenario
ScopeShield AI includes a pre-loaded, deterministic demo scenario matching the challenge specifications:

- **Project:** E-commerce Website Redesign
- **Client:** Modern Goods Ltd.
- **Budget:** ₹30,000
- **Hourly Rate:** ₹1,000/hr
- **Included:** Up to five (5) pages, responsive layout, product catalog, contact form, two (2) revision rounds.
- **Excluded:** Payment gateway integration (Razorpay/Stripe), additional pages beyond 5, ongoing maintenance.
- **Incoming Request:** *"The website looks good. Could you also add Razorpay checkout, three additional pages, and another round of revisions before Friday? We assumed these were included."*

### Expected System Output:
1. **Payment Gateway (Razorpay)** ➔ 🔴 `Potential Scope Change` (Explicitly listed under Excluded Work; +12 hrs / ₹12,000).
2. **Three Additional Pages** ➔ 🔴 `Potential Scope Change` (Exceeds 5-page ceiling; +15 hrs / ₹15,000).
3. **Extra Revision Round** ➔ 🔴 `Potential Scope Change` (Exhausts contractual 2-round cap; +4 hrs / ₹4,000).
4. **Rush Request ("before Friday")** ➔ 🟡 `Needs Human Review` (Delivery timeline adjustment required).
5. **Addendum Total:** 31 billable hours = ₹31,000 additional fee with customized client approval email.

---

## Quickstart Guide (Windows PowerShell)

### Step 1: Install & Launch the Local Model
1. Download Ollama from [ollama.com/download](https://ollama.com/download).
2. Open Windows PowerShell:
```powershell
# Pull the quantized Qwen3 4B Instruct model (~2.5 GB)
ollama pull qwen3:4b-instruct

# Test model response
ollama run qwen3:4b-instruct
```

### Step 2: Start the React Frontend
Open a new PowerShell terminal:
```powershell
# Navigate to repository root
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### Step 3: Run the Python FastAPI Backend (Optional Local API)
Open another terminal:
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Open interactive Swagger OpenAPI docs at `http://localhost:8000/docs`.

### Step 4: Run Automated Tests
```powershell
cd backend
pytest tests/ -v
```

---

## Deploying Public Frontend to Render
1. Push repository to GitHub.
2. In Render Dashboard, click **New ➔ Static Site**.
3. Set **Build Command**: `npm install && npm run build`
4. Set **Publish Directory**: `dist`
5. Deploy! The frontend automatically functions in **Interactive Demo Mode** for public reviewers, while enabling **Local AI Mode** when connected to localhost Ollama.

---

## Model Card & License Attribution
- **Application Code:** [MIT License](LICENSE)
- **Model Distribution:** `qwen3:4b-instruct` under the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0) by the Qwen Team / Alibaba Cloud.
- **Inference Runtime:** Powered by the open-source Ollama framework. Model weights are run locally by the user and are not bundled into this source repository.
