# Liimra Fuse: AI-Powered Unit Economics Platform

This application will transform the static Excel UE model into a dynamic, AI-driven web application using the **Fuse Agents** architectural concept. 

## 1. Application Overview
The application will provide a chat-driven interface alongside real-time dashboards. Users can interact with the **Financial Orchestrator Agent**, which will autonomously route queries to specialized worker agents (Data Ingestion, UE Engine, Scenario/What-If, Reporting) to provide insights, run simulations, and update data.

## 2. Technical Stack
*   **Frontend:** Next.js (React) for a responsive, modern UI.
*   **Styling:** Vanilla CSS with modern aesthetics (glassmorphism, dark mode, smooth gradients) per web design guidelines.
*   **Backend / API:** Python (FastAPI) to handle AI processing and heavy calculations.
*   **AI / Agent Framework:** CrewAI or LangGraph for managing the Fuse Agent orchestration.
*   **Data Layer:** 
    *   PostgreSQL: To store the structured time-series data from `FY2627 Actuals` and `Monthly PvA`.
    *   Vector Database (e.g., ChromaDB): To store unstructured assumptions and `📋 Documentation`.

## 3. Core Features & Agent Mapping
1.  **Executive Dashboard (Reporting Agent):** Real-time MTD variance reports and automated root-cause analysis when margins slip.
2.  **Scenario Sandbox (What-If Agent):** A dedicated view where users can use sliders (e.g., "Adjust Ad Spend %") or natural language to simulate financial impacts.
3.  **Chat Interface (Orchestrator Agent):** The main "Fuse" point where users can ask questions like, *"Which SKU is dragging down our contribution margin this week?"*

## User Review Required
> [!IMPORTANT]
> Please review the proposed Tech Stack and Features above. 
> 1. Do you have a preference for the Agent Framework (CrewAI vs LangGraph)? 
> 2. Would you like me to proceed with creating the detailed step-by-step to-do list (`task.md`) for building this application?

## Proposed Changes
This is a greenfield application build. We will be scaffolding a new project.

### Frontend Components
#### [NEW] `frontend/` (Next.js Application)
#### [NEW] `frontend/src/components/Dashboard.jsx`
#### [NEW] `frontend/src/components/ChatInterface.jsx`
#### [NEW] `frontend/src/components/ScenarioSimulator.jsx`
#### [NEW] `frontend/src/index.css` (Premium styling implementation)

### Backend Services (Fuse Agents)
#### [NEW] `backend/` (FastAPI Application)
#### [NEW] `backend/agents/orchestrator.py` (The Fuse Agent)
#### [NEW] `backend/agents/ue_engine.py` (Marketplace calculations)
#### [NEW] `backend/agents/scenario_agent.py` (What-If logic)
#### [NEW] `backend/main.py` (API Endpoints)

## Verification Plan
### Automated Tests
*   **Unit Tests:** For the deterministic math inside the `ue_engine.py` to ensure it exactly matches the Excel file's logic.
*   **Agent Mocking:** Simulating user prompts to ensure the Orchestrator correctly routes to the appropriate worker agent.

### Manual Verification
*   Running a "What-If" scenario in the web app and comparing the output margin to the `🎛 What-If Model` sheet in the original Excel file.
