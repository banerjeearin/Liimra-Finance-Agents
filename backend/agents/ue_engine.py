from models import SKUData, UEMetrics

class MarketplaceUEAgent:
    """
    The deterministic mathematical engine for calculating Unit Economics.
    This component does not use an LLM for calculations to prevent hallucinations.
    """
    
    @staticmethod
    def calculate_sku_metrics(sku: SKUData) -> UEMetrics:
        """
        Calculate gross profit and contribution margin for a single SKU.
        """
        gross_revenue = sku.price
        # Net revenue after marketplace fee
        marketplace_fee_amount = sku.price * sku.marketplace_fee_pct
        net_revenue = gross_revenue - marketplace_fee_amount
        
        # Total COGS includes manufacturing/sourcing cost
        total_cogs = sku.cogs
        
        gross_profit = net_revenue - total_cogs
        gross_margin_pct = (gross_profit / gross_revenue) if gross_revenue > 0 else 0.0
        
        # Contribution Margin subtracts fulfillment and marketing
        contribution_margin = gross_profit - sku.fulfillment_cost - sku.ad_spend
        contribution_margin_pct = (contribution_margin / gross_revenue) if gross_revenue > 0 else 0.0
        
        return UEMetrics(
            sku_id=sku.sku_id,
            gross_revenue=gross_revenue,
            net_revenue=net_revenue,
            total_cogs=total_cogs,
            gross_profit=gross_profit,
            gross_margin_pct=gross_margin_pct,
            contribution_margin=contribution_margin,
            contribution_margin_pct=contribution_margin_pct
        )

    def process_all_skus(self, skus: list[SKUData]) -> list[UEMetrics]:
        """
        Process a batch of SKUs.
        """
        return [self.calculate_sku_metrics(sku) for sku in skus]
