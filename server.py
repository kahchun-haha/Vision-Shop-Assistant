from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import json
import base64
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)

# 1. LOAD YOUR MODEL
# Ensure you renamed 'best.pt' to 'model.pt' and put it in this folder!
model_path = 'model.pt'

if not os.path.exists(model_path):
    print(f"ERROR: '{model_path}' not found. Please move best.pt here and rename it.")
    # We don't exit here so the server still starts and tells you the error
else:
    model = YOLO(model_path)

# 2. LOAD DATABASE
if not os.path.exists('products.json'):
    print("ERROR: 'products.json' not found. Please copy it here.")
    products_db = {}
else:
    with open('products.json', 'r') as f:
        products_db = json.load(f)

@app.route('/detect', methods=['POST'])
def detect():
    if not os.path.exists(model_path):
        return jsonify({"itemFound": False, "reason": "Server Error: model.pt missing"})

    try:
        data = request.json
        image_data = data.get('image', '')
        
        # Clean base64 string
        if "," in image_data:
            image_data = image_data.split(",")[1]
            
        if not image_data:
             return jsonify({"itemFound": False, "reason": "No image data sent"})

        img_bytes = base64.b64decode(image_data)
        img = Image.open(io.BytesIO(img_bytes))

        # Run YOLO
        results = model(img)
        
        best_conf = 0
        detected_item = None

        for result in results:
            for box in result.boxes:
                conf = float(box.conf[0])
                cls_id = int(box.cls[0])
                class_name = model.names[cls_id]

                if conf > 0.5 and conf > best_conf:
                    best_conf = conf
                    detected_item = class_name

        # Match with JSON
        if detected_item and detected_item in products_db:
            product_info = products_db[detected_item]
            return jsonify({
                "itemFound": True,
                "name": product_info['alias'],
                "price": product_info['price'],
                "category": "Groceries",
                "confidence": best_conf
            })
        
        return jsonify({"itemFound": False, "reason": "No item detected"})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"itemFound": False, "reason": str(e)})

if __name__ == '__main__':
    # 'adhoc' generates a quick SSL certificate automatically
    app.run(host='0.0.0.0', port=5000, debug=True, ssl_context='adhoc')