from os import environ
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from modules.demand_predictor import get_demand_forecast

app = Flask(__name__)
CORS(app)

CSV_DATA_PATH = "data/daily_sales.csv"

@app.route('/ping', methods=['GET'])
@cross_origin()
def ping():
    return jsonify({"response": "pong"})

@app.route('/')
def hello():
    return 'Hello, World!'

@app.route('/predict-demand', methods=['GET'])
@cross_origin()
def predict_demand():
    try:
        csv_path = CSV_DATA_PATH
        forecast = get_demand_forecast(csv_path=csv_path)
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

if __name__ == '__main__':
    port = int(environ.get("PORT", 5000))
    app.run(host='127.0.0.1', port=port, debug=True)