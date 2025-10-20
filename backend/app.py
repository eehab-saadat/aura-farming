from os import environ
from time import sleep
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)

@app.route('/ping', methods=['GET'])
@cross_origin()
def ping():
    return jsonify({"response": "pong"})

@app.route('/')
def hello():
    return 'Hello, World!'

if __name__ == '__main__':
    port = int(environ.get("PORT", 5000))
    app.run(host='127.0.0.1', port=port, debug=True)