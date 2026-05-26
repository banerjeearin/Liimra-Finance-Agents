# Implementation Tasks: Liimra Fuse Application

This checklist tracks the step-by-step implementation for the Liimra Fuse Agent Platform.

## 1. Project Initialization & Setup
- `[ ]` **Repository Structure:** Create `frontend/` and `backend/` directories.
- `[ ]` **Backend Setup:** Initialize Python project, install FastAPI, Uvicorn, Pandas, and LangGraph/CrewAI.
- `[ ]` **Frontend Setup:** Run `npx create-next-app@latest frontend` and configure basic routing.
- `[ ]` **Environment Variables:** Set up `.env` for LLM API keys (e.g., OpenAI/Anthropic), Database URIs.

## 2. Backend Implementation (The Fuse Agents)
- `[ ]` **Data Models (Pydantic):** Define schemas for UE metrics, SKU data, and What-If requests.
- `[ ]` **Data Ingestion Module:** Build Python scripts to load and parse the `FY2627 Actuals` and `Config` from the Excel file (or mock database).
- `[ ]` **Marketplace UE Agent:** 
  - `[ ]` Implement strict math logic to calculate SKU margins.
  - `[ ]` Write unit tests for profit calculation accuracy.
- `[ ]` **Scenario (What-If) Agent:** Implement the Monte Carlo / perturbation logic to run hypothetical scenarios.
- `[ ]` **Reporting Agent:** Implement prompt chains to summarize data into MTD variance insights.
- `[ ]` **Financial Orchestrator (The Fuse):** Build the routing logic to interpret user natural language queries and delegate to the appropriate worker agent.
- `[ ]` **API Endpoints:** Expose FastAPI routes (`/api/chat`, `/api/dashboard`, `/api/simulate`).

## 3. Frontend Implementation (UI/UX)
- `[ ]` **Design System:** Implement a premium aesthetic in `index.css` (dark mode, glassmorphism, accent colors).
- `[ ]` **Dashboard Component (`Dashboard.jsx`):** 
  - `[ ]` Integrate Recharts for visualizing MTD vs Plan.
  - `[ ]` Fetch and display summarized insights from the Reporting Agent.
- `[ ]` **Chat Interface (`ChatInterface.jsx`):**
  - `[ ]` Build message bubbles (User vs. Fuse Orchestrator).
  - `[ ]` Implement typing indicators and streaming responses.
- `[ ]` **Scenario Sandbox (`ScenarioSimulator.jsx`):**
  - `[ ]` Build sliders/inputs for variables (Ad Spend %, Shipping Costs).
  - `[ ]` Connect inputs to the `/api/simulate` endpoint and render updated charts.

## 4. Integration & Polishing
- `[ ]` **E2E Testing:** Verify that a chat query correctly triggers a scenario simulation and updates the dashboard.
- `[ ]` **Error Handling:** Ensure the Orchestrator gracefully handles out-of-domain questions.
- `[ ]` **Final Polish:** Add micro-animations and optimize loading states.
