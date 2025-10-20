# optimize_inventory.py - Simplified with Lost Sales Model
import numpy as np
import pandas as pd
from tqdm import tqdm
from joblib import Parallel, delayed
import time
from post_processor import analyze_inventory_policy


def simulate_one_path(demand, R, Q, L, h, p, K, I0, track_daily=False):
    """
    Simulate (R,Q) inventory policy with LOST SALES (no backorders).
    
    Parameters:
        demand: array of daily demand
        R: reorder point
        Q: order quantity
        L: lead time in days
        h: holding cost per unit per day
        p: penalty cost per lost sale
        K: fixed ordering cost
        I0: initial inventory
        track_daily: if True, returns daily tracking data
    
    Returns:
        total_cost, metrics dict, and optionally daily_data
    """
    T = len(demand)
    inventory = float(I0)
    pipeline = {}  # {arrival_day: quantity}
    
    total_holding_cost = 0.0
    total_stockout_cost = 0.0
    total_ordering_cost = 0.0
    orders_placed = 0
    total_demand = 0.0
    total_sales = 0.0
    
    daily_data = [] if track_daily else None
    
    for t in range(T):
        # Receive any orders arriving today
        if t in pipeline:
            inventory += pipeline.pop(t)
        
        # Check if we need to place an order (before demand)
        order_placed = 0
        if inventory <= R:
            # Place order of size Q, arriving in L days
            arrival_day = t + L
            pipeline[arrival_day] = pipeline.get(arrival_day, 0.0) + Q
            orders_placed += 1
            order_placed = 1
            total_ordering_cost += K
        
        # Demand occurs
        d = float(demand[t])
        total_demand += d
        
        # Fulfill demand (lost sales if insufficient inventory)
        if inventory >= d:
            sales = d
            inventory -= d
            lost_sales = 0.0
        else:
            sales = inventory
            lost_sales = d - inventory
            inventory = 0.0
        
        total_sales += sales
        
        # Calculate daily costs
        holding_cost = h * inventory
        stockout_cost = p * lost_sales
        
        total_holding_cost += holding_cost
        total_stockout_cost += stockout_cost
        
        if track_daily:
            daily_data.append({
                'day': t,
                'inventory': inventory,
                'demand': d,
                'sales': sales,
                'lost_sales': lost_sales,
                'order_placed': order_placed,
                'holding_cost': holding_cost,
                'stockout_cost': stockout_cost
            })
    
    total_cost = total_holding_cost + total_stockout_cost + total_ordering_cost
    fill_rate = total_sales / total_demand if total_demand > 0 else 1.0
    fill_rate = max(0.0, min(1.0, fill_rate))
    
    metrics = {
        'orders_placed': orders_placed,
        'fill_rate': fill_rate,
        'total_sales': total_sales,
        'total_lost_sales': total_demand - total_sales,
        'ending_inventory': inventory,
    }
    
    if track_daily:
        return total_cost, metrics, daily_data
    return total_cost, metrics


def simulate_policy_monte_carlo(mu, sigma, R, Q, L, h, p, K, I0, n_sims=200, n_jobs=4):
    """
    Run Monte Carlo simulation with normally distributed demand.
    
    Parameters:
        mu: array of mean daily demand
        sigma: array of std dev of daily demand
        R, Q, L, h, p, K, I0: policy and cost parameters
        n_sims: number of Monte Carlo simulations
        n_jobs: parallel jobs
    
    Returns:
        dict with aggregated statistics
    """
    T = len(mu)
    rng = np.random.default_rng(42)
    
    # Generate demand scenarios
    demand_scenarios = rng.normal(
        loc=mu[None, :], 
        scale=sigma[None, :], 
        size=(n_sims, T)
    )
    demand_scenarios = np.clip(demand_scenarios, 0, None)
    
    # Run simulations in parallel
    if n_jobs == 1:
        results = []
        for i in range(n_sims):
            cost, metrics = simulate_one_path(
                demand_scenarios[i], R, Q, L, h, p, K, I0, track_daily=False
            )
            results.append((cost, metrics))
    else:
        results = Parallel(n_jobs=n_jobs)(
            delayed(simulate_one_path)(
                demand_scenarios[i], R, Q, L, h, p, K, I0, track_daily=False
            )
            for i in range(n_sims)
        )
    
    costs, metrics_list = zip(*results)
    costs = np.array(costs)
    
    # Aggregate metrics
    orders = np.array([m['orders_placed'] for m in metrics_list])
    fill_rates = np.array([m['fill_rate'] for m in metrics_list])
    ending_inv = np.array([m['ending_inventory'] for m in metrics_list])
    
    return {
        'mean_cost': costs.mean(),
        'std_cost': costs.std(),
        'p5_cost': np.percentile(costs, 5),
        'p95_cost': np.percentile(costs, 95),
        'mean_orders': orders.mean(),
        'mean_fill_rate': fill_rates.mean(),
        'mean_ending_inventory': ending_inv.mean(),
    }


def grid_search_RQ(mu, sigma, R_grid, Q_grid, L, h, p, K, I0, n_sims=200, n_jobs=4):
    """
    Grid search over (R, Q) policies using Monte Carlo simulation.
    """
    best = None
    results = []
    
    total_combos = len(R_grid) * len(Q_grid)
    print(f"Testing {total_combos} policy combinations with {n_sims} simulations each...")
    
    with tqdm(total=total_combos, desc="Grid Search") as pbar:
        for R in R_grid:
            for Q in Q_grid:
                stats = simulate_policy_monte_carlo(
                    mu, sigma, R, Q, L, h, p, K, I0, n_sims, n_jobs
                )
                stats['R'] = R
                stats['Q'] = Q
                results.append(stats)
                
                if best is None or stats['mean_cost'] < best['mean_cost']:
                    best = stats.copy()
                
                pbar.update(1)
    
    df = pd.DataFrame(results)
    return df, best


if __name__ == "__main__":
    # sample usage for testing with analytics
    # Load predicted data
    csv_path = "d:/projects/aura-farming/backend/modules/predictions.csv"
    print(f"Loading predicted data from {csv_path}")
    df_pred = pd.read_csv(csv_path, parse_dates=["date"])
    
    # Aggregate demand by date (sum across all stores)
    demand_by_date = df_pred.groupby("date")["sales"].sum().sort_index()
    
    # Calculate mu and sigma per day (using stores as samples)
    pivot = df_pred.pivot_table(index="date", columns="store", values="sales")
    pivot = pivot.sort_index()
    
    mu = pivot.mean(axis=1).values.astype(float)
    sigma = pivot.std(axis=1).fillna(1.0).values.astype(float)
    sigma = np.maximum(sigma, 1.0)  # Floor at 1.0
    
    T = len(mu)
    mean_demand = mu.mean()
    std_demand = mu.std()
    
    print(f"\n{'='*70}")
    print("DATA SUMMARY")
    print(f"{'='*70}")
    print(f"Forecast Horizon: {T} days")
    print(f"Date Range: {pivot.index[0].date()} to {pivot.index[-1].date()}")
    print(f"Number of stores: {len(pivot.columns)}")
    print(f"Total Demand (sum over all days): {mu.sum():.0f} units")
    print(f"Mean Daily Demand: {mean_demand:.1f} units")
    print(f"Std Daily Demand: {std_demand:.1f} units")
    print(f"Min Daily Demand: {mu.min():.0f} units")
    print(f"Max Daily Demand: {mu.max():.0f} units")
    
    # Debug: show first few and last few days
    print(f"\nFirst 3 days demand: {mu[:3]}")
    print(f"Last 3 days demand: {mu[-3:]}")
    
    # Cost parameters (adjusted to allow stockouts)
    h = 5.0      # holding cost per unit per day
    p = 20.0     # stockout cost per lost sale (6x holding cost - lower ratio)
    K = 200.0    # fixed ordering cost
    L = 1        # lead time = 1 day
    
    # Define search space - allow policies that will have stockouts
    # R should range from below to above lead time demand
    R_min = int(mean_demand * 0.3)   # Well below 1 day demand (will have stockouts)
    R_max = int(mean_demand * 2.0)   # Up to 2 days demand
    R_step = max(int((R_max - R_min) / 15), 50)
    R_grid = list(range(R_min, R_max + 1, R_step))
    
    # Q should be smaller for more frequent ordering
    Q_min = int(mean_demand * 0.5)   # Half day of demand
    Q_max = int(mean_demand * 5.0)   # Up to 5 days of demand
    Q_step = max(int((Q_max - Q_min) / 15), 50)
    Q_grid = list(range(Q_min, Q_max + 1, Q_step))
    
    # Initial inventory = only 0.5 days of demand (low start)
    I0 = mean_demand * 0.5
    
    print(f"\n{'='*70}")
    print("OPTIMIZATION CONFIGURATION")
    print(f"{'='*70}")
    print(f"Cost Parameters:")
    print(f"  Holding cost (h): ${h:.2f}/unit/day")
    print(f"  Stockout penalty (p): ${p:.2f}/lost sale (p/h ratio = {p/h:.1f}x)")
    print(f"  Fixed order cost (K): ${K:.2f}/order")
    print(f"  Lead time (L): {L} day")
    print(f"\nSearch Space:")
    print(f"  R (Reorder Point): {R_min} to {R_max} (step: {R_step})")
    print(f"    → {R_min/mean_demand:.2f} to {R_max/mean_demand:.2f} days of demand")
    print(f"  Q (Order Quantity): {Q_min} to {Q_max} (step: {Q_step})")
    print(f"    → {Q_min/mean_demand:.2f} to {Q_max/mean_demand:.2f} days of demand")
    print(f"  Total combinations: {len(R_grid) * len(Q_grid)}")
    print(f"  Monte Carlo simulations per policy: 200")
    print(f"  Initial Inventory: {I0:.0f} units ({I0/mean_demand:.2f} days)")
    print(f"{'='*70}")
    
    # Run grid search
    print("\nStarting optimization...")
    start = time.time()
    results_df, best = grid_search_RQ(
        mu=mu,
        sigma=sigma,
        R_grid=R_grid,
        Q_grid=Q_grid,
        L=L,
        h=h,
        p=p,
        K=K,
        I0=I0,
        n_sims=200,
        n_jobs=4
    )
    end = time.time()
    print(f"\nOptimization completed in {end-start:.1f}s")
    
    # Display optimal policy
    print(f"\n{'='*70}")
    print("OPTIMAL POLICY")
    print(f"{'='*70}")
    print(f"Reorder Point (R): {best['R']:.0f} units ({best['R']/mean_demand:.2f} days)")
    print(f"Order Quantity (Q): {best['Q']:.0f} units ({best['Q']/mean_demand:.2f} days)")
    print(f"\nCost Statistics (Monte Carlo):")
    print(f"  Mean Cost: ${best['mean_cost']:.2f}")
    print(f"  Std Cost: ${best['std_cost']:.2f}")
    print(f"  Cost Range (P5-P95): ${best['p5_cost']:.2f} - ${best['p95_cost']:.2f}")
    print(f"\nPerformance Metrics:")
    print(f"  Mean Fill Rate: {best['mean_fill_rate']*100:.1f}%")
    print(f"  Mean Orders Placed: {best['mean_orders']:.1f} over {T} days")
    print(f"  Mean Ending Inventory: {best['mean_ending_inventory']:.1f} units")
    
    # Run detailed deterministic simulation
    print(f"\n{'='*70}")
    print("DETAILED DETERMINISTIC SIMULATION")
    print(f"{'='*70}")
    
    cost_det, metrics_det, daily_data = simulate_one_path(
        demand=mu,
        R=best['R'],
        Q=best['Q'],
        L=L,
        h=h,
        p=p,
        K=K,
        I0=I0,
        track_daily=True
    )
    
    daily_df = pd.DataFrame(daily_data)
    
    # Use post_processor for detailed analysis
    analysis = analyze_inventory_policy(
        results_df=daily_df,
        policy={'R': best['R'], 'Q': best['Q']},
        demand_series=mu,
        h=h,
        p=p,
        K=K
    )
    
    total_cost = analysis['total_cost']
    holding_pct = (analysis['total_holding_cost']/total_cost*100) if total_cost > 0 else 0
    stockout_pct = (analysis['total_stockout_cost']/total_cost*100) if total_cost > 0 else 0
    ordering_pct = (analysis['total_ordering_cost']/total_cost*100) if total_cost > 0 else 0
    
    print(f"\nTotal Cost: ${total_cost:.2f}")
    print(f"  - Holding Cost: ${analysis['total_holding_cost']:.2f} ({holding_pct:.1f}%)")
    print(f"  - Stockout Cost: ${analysis['total_stockout_cost']:.2f} ({stockout_pct:.1f}%)")
    print(f"  - Ordering Cost: ${analysis['total_ordering_cost']:.2f} ({ordering_pct:.1f}%)")
    
    # Highlight cost balance
    if stockout_pct < 5:
        print(f"\n  ⚠️  WARNING: Stockout cost is very low ({stockout_pct:.1f}%)")
        print(f"      Policy is too conservative - consider lower R or higher p/h ratio")
    elif stockout_pct > 60:
        print(f"\n  ⚠️  WARNING: Stockout cost is very high ({stockout_pct:.1f}%)")
        print(f"      Policy is too aggressive - consider higher R or lower p/h ratio")
    else:
        print(f"\n  ✓ Cost balance is reasonable")
    
    print(f"\nService Levels:")
    print(f"  Fill Rate: {analysis['fill_rate']*100:.1f}%")
    print(f"  Total Lost Sales: {analysis.get('total_lost_sales', 0):.0f} units")
    
    print(f"\nInventory Metrics:")
    print(f"  Mean Inventory: {analysis['mean_inventory']:.1f} units")
    print(f"  Min Inventory: {daily_df['inventory'].min():.1f} units")
    print(f"  Max Inventory: {daily_df['inventory'].max():.1f} units")
    print(f"  Orders Placed: {analysis['num_orders']} over {T} days")
    print(f"  Days with Stockouts: {analysis.get('days_with_stockouts', 0)}/{T} "
          f"({analysis.get('days_with_stockouts', 0)/T*100:.1f}%)")
    
    print(f"{'='*70}")
    
    # Save results
    output_path = "d:/projects/aura-farming/backend/modules/optimization_results.csv"
    results_df.to_csv(output_path, index=False)
    print(f"\nAll policy results saved to: {output_path}")
    
    daily_output_path = "d:/projects/aura-farming/backend/modules/daily_simulation.csv"
    daily_df.to_csv(daily_output_path, index=False)
    print(f"Daily simulation saved to: {daily_output_path}")
