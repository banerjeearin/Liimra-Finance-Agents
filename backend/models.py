from pydantic import BaseModel, Field
from typing import List, Optional

class SKUData(BaseModel):
    sku_id: str
    product_name: str
    category: str
    price: float = Field(..., description="Selling price on the marketplace")
    cogs: float = Field(..., description="Cost of Goods Sold")
    fulfillment_cost: float = Field(..., description="Cost to pick, pack, and ship")
    marketplace_fee_pct: float = Field(..., description="Percentage fee taken by the marketplace")
    ad_spend: float = Field(0.0, description="Allocated marketing/ad spend per unit")

class UEMetrics(BaseModel):
    sku_id: str
    gross_revenue: float
    net_revenue: float
    total_cogs: float
    gross_profit: float
    gross_margin_pct: float
    contribution_margin: float
    contribution_margin_pct: float

class WhatIfRequest(BaseModel):
    sku_id: Optional[str] = None
    price_change_pct: Optional[float] = 0.0
    cogs_change_pct: Optional[float] = 0.0
    fulfillment_change_pct: Optional[float] = 0.0
    ad_spend_change_pct: Optional[float] = 0.0

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    agent_used: str
    data: Optional[dict] = None
