from os import environ
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from modules.demand_predictor import get_demand_forecast
from modules.optimizer import run_optimization
import pandas as pd
import sys
sys.path.append('modules')

app = Flask(__name__)
CORS(app)

CSV_PATH = "data/daily_sales.csv"


@app.route('/ping', methods=['GET'])
@cross_origin()
def ping():
    return jsonify({"response": "pong"})


@app.route('/')
def hello():
    return 'Hello, World!'


@app.route('/predict-demand', methods=['POST'])
@cross_origin()
def predict_demand():
    try:
        data = request.get_json() or {}
        days = data.get('days', 90)  # Default to 90 days if not specified

        csv_path = CSV_PATH
        forecast = get_demand_forecast(csv_path=csv_path, days=days)

        return jsonify({
            "success": True,
            "forecast": forecast,
            "total_days": len(forecast)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/data', methods=['GET'])
@cross_origin()
def get_data():
    try:
        df = pd.read_csv(CSV_PATH)
        # Remove store column from response
        df = df.drop(columns=['store'])
        return jsonify(df.to_dict(orient='records'))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/data', methods=['POST'])
@cross_origin()
def bulk_insert_data():
    try:
        data = request.get_json()
        if not isinstance(data, list):
            return jsonify({"error": "Data must be a list of objects"}), 400
        df_existing = pd.read_csv(CSV_PATH)
        df_new = pd.DataFrame(data)
        df_combined = pd.concat([df_existing, df_new], ignore_index=True)
        df_combined.to_csv(CSV_PATH, index=False)
        return jsonify({"message": f"Inserted {len(data)} entries"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/data/<int:index>', methods=['GET'])
@cross_origin()
def get_data_entry(index):
    try:
        df = pd.read_csv(CSV_PATH)
        if index < 0 or index >= len(df):
            return jsonify({"error": "Index out of range"}), 404
        entry = df.iloc[index].to_dict()
        # Remove store from response
        del entry['store']
        return jsonify(entry)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/data/<int:index>', methods=['PUT'])
@cross_origin()
def edit_data_entry(index):
    try:
        data = request.get_json()
        df = pd.read_csv(CSV_PATH)
        if index < 0 or index >= len(df):
            return jsonify({"error": "Index out of range"}), 404
        for key, value in data.items():
            if key in df.columns:
                df.at[index, key] = value
        df.to_csv(CSV_PATH, index=False)
        return jsonify({"message": "Entry updated"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/data/<int:index>', methods=['DELETE'])
@cross_origin()
def delete_data_entry(index):
    try:
        df = pd.read_csv(CSV_PATH)
        if index < 0 or index >= len(df):
            return jsonify({"error": "Index out of range"}), 404
        df = df.drop(index)
        df.to_csv(CSV_PATH, index=False)
        return jsonify({"message": "Entry deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/optimize-inventory', methods=['POST'])
@cross_origin()
def optimize_inventory():
    """
    Complete inventory optimization endpoint:
    1. Generates 90-day demand forecast using the demand predictor
    2. Runs Monte Carlo simulation to find optimal (R,Q) policy
    3. Analyzes performance with detailed metrics
    4. Returns comprehensive results including costs, service levels, and daily simulation
    
    Request body (optional):
        {
            "horizon": 90,  // forecast horizon in days
            "holding_cost": 5.0,  // cost per unit per day
            "stockout_penalty": 20.0,  // cost per lost sale
            "ordering_cost": 200.0,  // fixed cost per order
            "lead_time": 1,  // lead time in days
            "n_simulations": 200  // number of Monte Carlo simulations
        }
    
    Returns:
        {
            "success": true,
            "forecast": [...],  // 90-day demand forecast
            "optimal_policy": {...},  // R, Q, and cost parameters
            "cost_summary": {...},  // breakdown of costs
            "performance_metrics": {...},  // fill rate, stockouts, etc.
            "monte_carlo_stats": {...},  // statistical metrics from simulations
            "daily_simulation": [...],  // day-by-day inventory tracking
            "message": "..."
        }
    """
    try:
        # Get parameters from request or use defaults
        data = request.get_json() if request.is_json else {}
        
        horizon = data.get('horizon', 90)
        h = data.get('holding_cost', 5.0)
        p = data.get('stockout_penalty', 20.0)
        K = data.get('ordering_cost', 200.0)
        L = data.get('lead_time', 1)
        n_sims = data.get('n_simulations', 200)
        
        # Step 1: Generate demand forecast
        print(f"Generating {horizon}-day demand forecast...")
        forecast = get_demand_forecast(csv_path=CSV_PATH, horizon=horizon)
        
        # Convert forecast to DataFrame
        forecast_df = pd.DataFrame(forecast)
        forecast_df['date'] = pd.to_datetime(forecast_df['date'])
        
        # Step 2: Run optimization
        print(f"Running inventory optimization with h={h}, p={p}, K={K}, L={L}...")
        optimization_results = run_optimization(
            df_pred=forecast_df,
            h=h,
            p=p,
            K=K,
            L=L,
            n_sims=n_sims,
            n_jobs=4
        )
        
        # Step 3: Prepare comprehensive response
        response = {
            "success": True,
            "forecast": forecast,
            "optimal_policy": optimization_results['optimal_policy'],
            "cost_summary": optimization_results['cost_summary'],
            "performance_metrics": optimization_results['performance_metrics'],
            "monte_carlo_stats": optimization_results['monte_carlo_stats'],
            "daily_simulation": optimization_results['daily_simulation'],
            "message": f"Optimization completed successfully. Optimal policy: R={optimization_results['optimal_policy']['reorder_point']:.0f}, Q={optimization_results['optimal_policy']['order_quantity']:.0f}"
        }
        
        # Optional: include all tested policies if requested
        if data.get('include_all_policies', False):
            response['all_policies'] = optimization_results['all_policies']
        
        print(f"✓ Optimization complete: R={optimization_results['optimal_policy']['reorder_point']:.0f}, Q={optimization_results['optimal_policy']['order_quantity']:.0f}")
        print(f"  Fill Rate: {optimization_results['performance_metrics']['fill_rate']*100:.1f}%")
        print(f"  Total Cost: ${optimization_results['cost_summary']['total_cost']:.2f}")
        
        return jsonify(response)
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in optimization: {error_trace}")
        return jsonify({
            "success": False,
            "error": str(e),
            "error_trace": error_trace
        }), 500


if __name__ == '__main__':
    port = int(environ.get("PORT", 5000))
    app.run(host='127.0.0.1', port=port, debug=True)
