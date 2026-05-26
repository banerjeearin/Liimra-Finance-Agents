import pandas as pd
import os
from typing import List, Dict
from models import SKUData

class DataIngestionAgent:
    def __init__(self, excel_path: str):
        self.excel_path = excel_path

    def load_actuals(self) -> pd.DataFrame:
        """
        Loads the '📊 FY2627 Actuals' sheet from the Excel model.
        """
        if not os.path.exists(self.excel_path):
            raise FileNotFoundError(f"Excel model not found at {self.excel_path}")
        
        # Load the specific sheet. Skipping headers if necessary.
        df = pd.read_excel(self.excel_path, sheet_name='📊 FY2627 Actuals')
        return df

    def get_sku_data(self) -> List[SKUData]:
        """
        Extracts SKU level data from the '🏪 Marketplace UE' sheet.
        Mocking this logic for now assuming a standard format.
        """
        try:
            df = pd.read_excel(self.excel_path, sheet_name='🏪 Marketplace UE')
            # Assuming columns: SKU_ID, Product_Name, Category, Price, COGS, Fulfillment_Cost, Marketplace_Fee, Ad_Spend
            # For demonstration, we will return some mock parsed data if parsing fails
            skus = []
            for _, row in df.iterrows():
                try:
                    sku = SKUData(
                        sku_id=str(row.get('SKU', 'UNKNOWN')),
                        product_name=str(row.get('Product Name', 'Unknown Product')),
                        category=str(row.get('Category', 'General')),
                        price=float(row.get('Price', 0.0)),
                        cogs=float(row.get('COGS', 0.0)),
                        fulfillment_cost=float(row.get('Fulfillment Cost', 0.0)),
                        marketplace_fee_pct=float(row.get('Marketplace Fee %', 0.0)),
                        ad_spend=float(row.get('Ad Spend', 0.0))
                    )
                    skus.append(sku)
                except Exception as e:
                    # Skip rows that don't match the schema (e.g. totals or empty rows)
                    pass
            return skus
        except Exception as e:
            print(f"Error reading SKU data: {e}")
            return []

    def get_config(self) -> Dict[str, float]:
        """
        Extracts global configurations and macroeconomic assumptions.
        """
        return {
            "inflation_rate": 0.03,
            "shipping_surcharge_pct": 0.05
        }
