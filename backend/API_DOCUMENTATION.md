# Inventory Optimization API Documentation

## Endpoint: `/optimize-inventory`

**Method:** `POST`  
**Description:** Complete inventory optimization pipeline that forecasts demand, finds optimal stock levels, and provides detailed analytics.

### Request

**URL:** `http://localhost:5000/optimize-inventory`

**Headers:**
```
Content-Type: application/json
```

**Body (all parameters optional):**
```json
{
  "horizon": 90,
  "holding_cost": 5.0,
  "stockout_penalty": 20.0,
  "ordering_cost": 200.0,
  "lead_time": 1,
  "n_simulations": 200,
  "include_all_policies": false
}
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `horizon` | integer | 90 | Forecast horizon in days (e.g., 30, 60, 90) |
| `holding_cost` | float | 5.0 | Cost per unit held in inventory per day ($/unit/day) |
| `stockout_penalty` | float | 20.0 | Cost per lost sale due to stockout ($/unit) |
| `ordering_cost` | float | 200.0 | Fixed cost per order placed ($) |
| `lead_time` | integer | 1 | Lead time between order placement and receipt (days) |
| `n_simulations` | integer | 200 | Number of Monte Carlo simulations for robustness |
| `include_all_policies` | boolean | false | If true, returns all tested (R,Q) policies |

### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Optimization completed successfully. Optimal policy: R=1469, Q=2939",
  
  "optimal_policy": {
    "reorder_point": 1469.0,
    "order_quantity": 2939.0,
    "lead_time": 1,
    "holding_cost": 5.0,
    "stockout_penalty": 20.0,
    "ordering_cost": 200.0,
    "initial_inventory": 734.5
  },
  
  "cost_summary": {
    "total_cost": 45230.50,
    "holding_cost": 22500.30,
    "stockout_cost": 8450.20,
    "ordering_cost": 14280.00,
    "holding_pct": 49.7,
    "stockout_pct": 18.7,
    "ordering_pct": 31.6
  },
  
  "performance_metrics": {
    "fill_rate": 0.915,
    "stockout_rate": 0.085,
    "total_lost_sales": 1250.5,
    "days_with_stockouts": 12,
    "total_days": 90,
    "mean_inventory": 1234.5,
    "num_orders": 28
  },
  
  "monte_carlo_stats": {
    "mean_cost": 45500.20,
    "std_cost": 3200.50,
    "p5_cost": 39800.00,
    "p95_cost": 51200.00,
    "mean_fill_rate": 0.913,
    "mean_orders": 27.8
  },
  
  "forecast": [
    {"date": "2024-01-01", "demand": 1450},
    {"date": "2024-01-02", "demand": 1523},
    ...
  ],
  
  "daily_simulation": [
    {
      "day": 0,
      "inventory": 1200.5,
      "demand": 1450.0,
      "sales": 1200.5,
      "lost_sales": 249.5,
      "order_placed": 1,
      "holding_cost": 6002.5,
      "stockout_cost": 4990.0
    },
    ...
  ]
}
```

**Error Response (500):**

```json
{
  "success": false,
  "error": "Error message here",
  "error_trace": "Full stack trace for debugging"
}
```

### Response Fields

#### `optimal_policy`
The best (R,Q) inventory policy found:
- **reorder_point (R)**: When inventory drops to or below this level, place an order
- **order_quantity (Q)**: How many units to order each time
- **lead_time (L)**: Days between ordering and receiving inventory

#### `cost_summary`
Breakdown of total costs:
- **total_cost**: Sum of all costs over the planning horizon
- **holding_cost**: Cost of carrying inventory
- **stockout_cost**: Penalty costs from lost sales
- **ordering_cost**: Fixed costs from placing orders
- **_pct fields**: Percentage breakdown of each cost component

#### `performance_metrics`
Service level and operational metrics:
- **fill_rate**: Proportion of demand satisfied (e.g., 0.915 = 91.5%)
- **stockout_rate**: Proportion of demand lost (1 - fill_rate)
- **total_lost_sales**: Total units of demand that couldn't be fulfilled
- **days_with_stockouts**: Number of days with any stockout
- **num_orders**: Total orders placed during the horizon

#### `monte_carlo_stats`
Statistical robustness metrics from simulations:
- **mean_cost**: Average cost across all scenarios
- **std_cost**: Standard deviation (uncertainty measure)
- **p5_cost / p95_cost**: 5th and 95th percentile costs (risk bounds)
- **mean_fill_rate**: Average fill rate across scenarios

#### `daily_simulation`
Day-by-day inventory dynamics for analysis and visualization

### Usage Examples

#### Example 1: Default Optimization
```python
import requests

response = requests.post('http://localhost:5000/optimize-inventory', json={})
result = response.json()

print(f"Optimal R: {result['optimal_policy']['reorder_point']}")
print(f"Optimal Q: {result['optimal_policy']['order_quantity']}")
print(f"Fill Rate: {result['performance_metrics']['fill_rate']*100:.1f}%")
```

#### Example 2: Custom Cost Parameters
```python
response = requests.post('http://localhost:5000/optimize-inventory', json={
    "holding_cost": 3.0,        # Lower holding cost
    "stockout_penalty": 50.0,   # Higher stockout penalty
    "ordering_cost": 100.0,     # Lower ordering cost
    "n_simulations": 500        # More simulations for accuracy
})
```

#### Example 3: JavaScript/Frontend Usage
```javascript
const optimizeInventory = async () => {
  const response = await fetch('http://localhost:5000/optimize-inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      holding_cost: 5.0,
      stockout_penalty: 20.0,
      ordering_cost: 200.0
    })
  });
  
  const result = await response.json();
  console.log('Optimal Policy:', result.optimal_policy);
  console.log('Fill Rate:', (result.performance_metrics.fill_rate * 100).toFixed(1) + '%');
};
```

### How It Works

1. **Demand Forecasting**: Uses LightGBM model with lag and rolling window features to predict next 90 days of demand
2. **Grid Search**: Tests multiple (R,Q) policy combinations
3. **Monte Carlo Simulation**: For each policy, runs 200+ simulations with stochastic demand
4. **Policy Selection**: Chooses (R,Q) that minimizes expected total cost
5. **Detailed Analysis**: Runs deterministic simulation with mean demand for precise metrics

### Interpreting Results

**Good Cost Balance:**
- Holding: 40-50%
- Stockout: 20-40%
- Ordering: 20-30%

**Fill Rate Guidelines:**
- 85-92%: Good balance of cost and service
- >95%: May be over-stocking (too conservative)
- <80%: May be under-stocking (too many stockouts)

**Order Frequency:**
- Should have orders every 3-6 days on average
- Too frequent: High ordering costs
- Too infrequent: High holding or stockout costs

### Testing

Run the test script:
```bash
# Start the Flask server
python backend/app.py

# In another terminal
python backend/test_optimization_endpoint.py
```

