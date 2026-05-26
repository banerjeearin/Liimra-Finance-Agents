from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from models import ChatRequest, ChatResponse, WhatIfRequest, UEMetrics, SKUData
from agents.orchestrator import OrchestratorAgent
from agents.data_ingestion import DataIngestionAgent
from agents.ue_engine import MarketplaceUEAgent
from agents.scenario_agent import ScenarioAgent
from agents.reporting_agent import ReportingAgent

import os

app = FastAPI(title="Liimra Fuse API", version="1.0")

# Setup CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only, should be restricted in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Agents
excel_path = os.path.join(os.path.dirname(__file__), "..", "Liimra_UE_FY2627_Model_1.xlsx")
data_agent = DataIngestionAgent(excel_path)
ue_engine = MarketplaceUEAgent()
scenario_agent = ScenarioAgent(ue_engine)
reporting_agent = ReportingAgent()
orchestrator = OrchestratorAgent()

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Main entrypoint for natural language queries to the Fuse Orchestrator.
    """
    try:
        response = orchestrator.process_query(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard", response_model=dict)
async def get_dashboard_metrics():
    """
    Fetches base SKUs, processes them through UE engine, and returns insights.
    """
    try:
        skus = data_agent.get_sku_data()
        metrics = ue_engine.process_all_skus(skus)
        summary = reporting_agent.generate_mtd_summary(metrics)
        
        return {
            "metrics": [m.model_dump() for m in metrics],
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/simulate", response_model=List[UEMetrics])
async def simulate_scenario(request: WhatIfRequest):
    """
    Runs a What-If scenario using the Scenario Agent.
    """
    try:
        base_skus = data_agent.get_sku_data()
        simulated_metrics = scenario_agent.simulate_scenario(base_skus, request)
        return simulated_metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
