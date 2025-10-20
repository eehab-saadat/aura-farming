# post_processor.py - Analysis for Lost Sales Model

import numpy as np
import pandas as pd


def analyze_inventory_policy(results_df, policy, demand_series, h, p, K):
    """
    Analyze inventory policy performance with LOST SALES model.
    
    Parameters:
        results_df (pd.DataFrame): Daily simulation data with columns:
            - 'inventory': on-hand inventory each day
            - 'lost_sales': sales lost due to stockout
            - 'order_placed': 1 if order placed, 0 otherwise
            - 'holding_cost': holding cost for the day
            - 'stockout_cost': stockout cost for the day
        policy (dict): {'R': reorder_point, 'Q': order_quantity}
        demand_series (np.array or pd.Series): Daily demand
        h (float): Holding cost per unit per day
        p (float): Stockout penalty per lost sale
        K (float): Fixed cost per order
    
    Returns:
        dict: Analysis results with costs and performance metrics
    """
    
    # Calculate costs
    if 'holding_cost' in results_df.columns:
        holding_cost = results_df['holding_cost'].sum()
    else:
        holding_cost = h * results_df['inventory'].sum()
    
    if 'stockout_cost' in results_df.columns:
        stockout_cost = results_df['stockout_cost'].sum()
    elif 'lost_sales' in results_df.columns:
        stockout_cost = p * results_df['lost_sales'].sum()
    else:
        stockout_cost = 0.0
    
    num_orders = int(results_df["order_placed"].sum()) if "order_placed" in results_df.columns else 0
    ordering_cost = K * num_orders
    
    total_cost = holding_cost + stockout_cost + ordering_cost
    
    # Calculate service metrics
    total_demand = np.sum(demand_series)
    
    if 'sales' in results_df.columns:
        total_sales = results_df['sales'].sum()
    elif 'lost_sales' in results_df.columns:
        total_sales = total_demand - results_df['lost_sales'].sum()
    else:
        total_sales = total_demand
    
    fill_rate = total_sales / total_demand if total_demand > 0 else 1.0
    fill_rate = max(0.0, min(1.0, fill_rate))  # Clamp to [0, 1]
    
    stockout_rate = 1 - fill_rate
    mean_inventory = results_df['inventory'].mean()
    
    # Additional metrics
    if 'lost_sales' in results_df.columns:
        total_lost_sales = results_df['lost_sales'].sum()
        days_with_stockouts = (results_df['lost_sales'] > 0).sum()
    else:
        total_lost_sales = 0
        days_with_stockouts = 0
    
    return {
        "policy": policy,
        "total_cost": total_cost,
        "total_holding_cost": holding_cost,
        "total_stockout_cost": stockout_cost,
        "total_ordering_cost": ordering_cost,
        "fill_rate": fill_rate,
        "stockout_rate": stockout_rate,
        "num_orders": num_orders,
        "mean_inventory": mean_inventory,
        "total_lost_sales": total_lost_sales,
        "days_with_stockouts": days_with_stockouts,
    }
