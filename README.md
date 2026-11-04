# ScopeShield AI 🛡️
> **Intelligent Scope Protection for Independent Professionals**  
> *The Control Room for Your Work Boundaries.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Model: Qwen3 4B Instruct](https://img.shields.io/badge/Model-Qwen3%204B%20Instruct%20(Apache%202.0)-7255E8)](https://ollama.com/library/qwen3)
[![Local AI: Ollama](https://img.shields.io/badge/Local%20AI-Ollama%2011434-42B9A8)](https://ollama.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF)](https://vitejs.dev/)

## ⚡ Overview

Freelancers and independent consultants routinely agree to fixed-scope projects only to watch profit margins evaporate under "small follow-up requests":
- *"Could you also add a payment gateway checkout?"*
- *"Can we just include three more landing pages?"*
- *"One last round of revisions, please. We assumed this was included."*

Each addition sounds minor in isolation, but together they turn profitable client engagements into dozens of hours of unpaid labor.

**ScopeShield AI** provides a dedicated, privacy-first command center that parses client messages (email, Slack, WhatsApp), compares them against signed contractual clauses, visualizes boundary breaches on a topological **Scope Map**, and generates courteous, client-ready **Change Orders** in seconds.

## 🏛️ Key Capabilities

### 1. 🧭 The Scope Map (Signature Boundary Topology)
Represents your master agreement as a central geometric boundary and plots incoming client requirements in real-time across three spatial zones:
- **Zone I — Core Baseline (Inside Boundary)**: Contracted deliverables guaranteed within original scope.
- **Zone II — Boundary Threshold (Edge)**: Ambiguous requirements flagged for clarification before execution.
- **Zone III — Outside Orbit (Scope Breach)**: Out-of-scope additions connected via topological vectors displaying hour and cost deltas ($+12\text{h}$, $+15\text{h}$, etc.).

### 2. ⚡ Scope Intelligence Workspace
Immersive split-screen comparative environment:
- **Left Panel (Original Agreement)**: Full document view of contracted deliverables, explicit exclusions, and revision caps.
- **Right Panel (Client Request Studio)**: Real-time message input with instant scenario presets.
- **5-Stage Deterministic Evaluation**:
  1. *Reading original agreement clauses...*
  2. *Extracting request requirements from client message...*
  3. *Matching deliverables against contract boundaries...*
  4. *Evaluating scope differences & timeline impact...*
  5. *Preparing verified intelligence report...*
- **Intelligence Classification**:
  - 🟢 **IN SCOPE**: Verified within agreed deliverables ($0$ billable delta).
  - 🟡 **NEEDS CLARIFICATION**: Ambiguous scope; asks specific questions before committing.
  - 🟣 **OUT OF SCOPE**: Exceeds agreement; itemizes extra hours, rate, and fee addendums.
- **Visual Evidence Matrix**: Maps incoming client sentences directly to exact contractual exclusions and deliverables.

### 3. ✍️ Client Response Studio
Turn boundary defense into a high-touch client experience under the philosophy *"Say it professionally"*:
- Choose from 3 calibrated communication tones: **Friendly**, **Professional**, or **Firm but polite**.
- In-line editable response canvas with one-click clipboard copying.
- Never sends messages automatically—you retain total control.

### 4. 📄 Change Request Studio
A document-grade proposal editor and typesetting engine:
- User-specified additional deliverables, reasons for change, hours, and rates.
- Live preview formatted like a high-end corporate business document with unique ID (`CR-2026-xxx`), party address block, cost breakdown table, schedule impact, and authorization lines.
- One-click **PDF Export** via optimized print stylesheets.

### 5. 🗂️ Dedicated Project Environments
Each project receives its own environment equipped with 5 dedicated tabs:
- **Overview**: Real-time financial metrics, revision counters, and embedded Scope Map.
- **Agreement**: Document view of deliverables, exclusions, and payment milestones.
- **Requests**: Historical audit of analyzed client inquiries.
- **Proposals**: Active, sent, and approved Change Orders.
- **History**: Chronological project audit trail.

## 🔒 Privacy-First & Zero-Cloud Guarantee

Client contracts and confidential Slack conversations are sensitive business secrets. ScopeShield AI is engineered around local execution:
- **Local LLM**: Built for open-weight **Qwen3 4B Instruct** running privately via Ollama on your own machine.
- **Zero Cloud Leakage**: No client messages, budgets, or contract deliverables are dispatched to proprietary cloud APIs.
- **Offline Fallback Heuristics**: Automatically transitions to verified deterministic contract parsing when Ollama is offline or in sample mode.

## 🚀 Quickstart Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Ollama](https://ollama.com/) (Optional, for local LLM inference)

### Step 1: Clone & Install Dependencies
```bash
git clone https://github.com/Tanya-garg10/ScopeShield-AI-Intelligent-Scope-Creep-Detection-Freelancer-Protection.git
cd ScopeShield-AI-Intelligent-Scope-Creep-Detection-Freelancer-Protection

# Install frontend dependencies
npm install --legacy-peer-deps
```

### Step 2: (Optional) Pull the Local Open-Weight Model
```bash
# Pull Qwen3 4B Instruct via Ollama (~2.5 GB)
ollama pull qwen3:4b-instruct

# Run Ollama in background
ollama run qwen3:4b-instruct
```
> *Note: If Ollama is not installed or running, ScopeShield AI automatically operates in **Verified Sample Mode** using browser-based deterministic contract heuristics.*

### Step 3: Launch Frontend Application
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Step 4: (Optional) Python FastAPI Backend
For backend API integration and automated pytest test suites:
```bash
cd backend
python -m venv .venv

# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1

# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- Interactive OpenAPI Swagger Documentation: `http://localhost:8000/docs`
- Run test suite:
```bash
pytest tests/ -v
```

## 🧪 Official Demo Scenario

ScopeShield AI includes a pre-loaded, deterministic scenario to test boundary analysis:

* **Project**: E-commerce Website Redesign
* **Client**: Modern Goods Ltd.
* **Agreed Scope**: ₹30,000 base budget, up to 5 custom responsive pages, 2 revision rounds.
* **Agreed Exclusions**: Payment gateway integration (Razorpay/Stripe), additional pages beyond 5.
* **Client Inquiry**:
  > *"The website looks good. Could you also add Razorpay checkout, three additional pages, and another round of revisions before Friday? We assumed these were included."*

### System Analysis Breakdown:
1. **Razorpay Checkout** ➔ 🟣 `OUT OF SCOPE` (Section "Excluded Work": Payment gateway integration explicitly excluded; $+12\text{h}$ / ₹12,000).
2. **Three Additional Pages** ➔ 🟣 `OUT OF SCOPE` (Section "Included Deliverables": Contract capped at 5 pages; $+15\text{h}$ / ₹15,000).
3. **Extra Revision Round** ➔ 🟣 `OUT OF SCOPE` (Section "Revision Policy": All 2 rounds consumed; $+4\text{h}$ / ₹4,000).
4. **Rush Timeline ("before Friday")** ➔ 🟡 `NEEDS CLARIFICATION` (Milestone reschedule required).
5. **Change Order Total**: $31$ billable hours = ₹31,000 addendum fee with client approval draft and PDF proposal.

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
|---|---|
| **Design System** | Swiss Editorial Minimalism, Tailwind CSS v4 |
| **Frontend Framework** | React 19, TypeScript, Vite 8, Lucide React, Framer Motion |
| **Local AI Engine** | Ollama, Qwen3 4B Instruct (Apache 2.0) |
| **Backend (Optional)** | Python 3.11+, FastAPI, Uvicorn, Pytest |
| **Storage & Persistence** | Browser LocalStorage / IndexedDB with JSON Export/Import |

## 📜 License & Attribution

- **Application Codebase**: Released under the [MIT License](LICENSE).
- **Model Distribution**: `qwen3:4b-instruct` released under the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0) by the Qwen Team / Alibaba Cloud.
- **Inference Runtime**: Powered by [Ollama](https://ollama.com).

*Crafted with precision for independent creators, developers, and consultants.*
