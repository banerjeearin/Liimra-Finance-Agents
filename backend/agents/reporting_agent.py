from typing import List
from models import UEMetrics

class ReportingAgent:
    """
    Summarizes Unit Economics metrics into natural language insights.
    """
    
    def generate_mtd_summary(self, metrics: List[UEMetrics]) -> str:
        """
        Creates a summary of the metrics.
        """
        total_revenue = sum([m.gross_revenue for m in metrics])
        total_profit = sum([m.gross_profit for m in metrics])
        
        if total_revenue == 0:
            return "No revenue data available to generate a summary."
            
        margin_pct = (total_profit / total_revenue) * 100
        
        summary = f"Month-to-Date Summary: Generated ${total_revenue:,.2f} in Gross Revenue with a total Gross Profit of ${total_profit:,.2f} ({margin_pct:.2f}% Margin)."
        
        # Add basic anomaly detection insight
        if margin_pct < 20.0:
            summary += " Warning: Gross margins are below target thresholds."
            
        return summary
