import pytest
from models import SKUData
from agents.ue_engine import MarketplaceUEAgent

def test_calculate_sku_metrics():
    engine = MarketplaceUEAgent()
    
    sku = SKUData(
        sku_id="SKU123",
        product_name="Test Product",
        category="Test Category",
        price=100.0,
        cogs=30.0,
        fulfillment_cost=10.0,
        marketplace_fee_pct=0.15,
        ad_spend=5.0
    )
    
    metrics = engine.calculate_sku_metrics(sku)
    
    # Assertions
    assert metrics.gross_revenue == 100.0
    assert metrics.net_revenue == 85.0 # 100 - (100 * 0.15)
    assert metrics.total_cogs == 30.0
    assert metrics.gross_profit == 55.0 # 85 - 30
    assert metrics.gross_margin_pct == 0.55 # 55 / 100
    assert metrics.contribution_margin == 40.0 # 55 - 10 - 5
    assert metrics.contribution_margin_pct == 0.40 # 40 / 100
