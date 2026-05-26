from typing import List
import copy
from models import SKUData, UEMetrics, WhatIfRequest
from agents.ue_engine import MarketplaceUEAgent

class ScenarioAgent:
    """
    Handles What-If scenarios by applying perturbations to the base data
    and returning the simulated results via the UE Engine.
    """
    
    def __init__(self, ue_engine: MarketplaceUEAgent):
        self.ue_engine = ue_engine
        
    def simulate_scenario(self, base_skus: List[SKUData], request: WhatIfRequest) -> List[UEMetrics]:
        """
        Applies changes to SKUs and calculates the new UE Metrics.
        """
        simulated_skus = []
        
        for sku in base_skus:
            # Deep copy to prevent modifying the base data (immutable state for what-if)
            sim_sku = copy.deepcopy(sku)
            
            # If a specific SKU is targeted, only apply to that SKU, else apply globally
            if request.sku_id is None or sim_sku.sku_id == request.sku_id:
                # Apply percentage changes
                if request.price_change_pct:
                    sim_sku.price *= (1 + request.price_change_pct)
                if request.cogs_change_pct:
                    sim_sku.cogs *= (1 + request.cogs_change_pct)
                if request.fulfillment_change_pct:
                    sim_sku.fulfillment_cost *= (1 + request.fulfillment_change_pct)
                if request.ad_spend_change_pct:
                    sim_sku.ad_spend *= (1 + request.ad_spend_change_pct)
            
            simulated_skus.append(sim_sku)
            
        # Run the modified SKUs through the deterministic UE Engine
        return self.ue_engine.process_all_skus(simulated_skus)
