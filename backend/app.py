from os import environ
from time import sleep
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import pandas as pd

app = Flask(__name__)
CORS(app)

CSV_PATH = 'data/processed_data.csv'


@app.route('/ping', methods=['GET'])
@cross_origin()
def ping():
    return jsonify({"response": "pong"})


@app.route('/')
def hello():
    return 'Hello, World!'


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


if __name__ == '__main__':
    port = int(environ.get("PORT", 5000))
    app.run(host='127.0.0.1', port=port, debug=True)
