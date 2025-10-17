from flask import Flask, send_file, request, jsonify
from transformers import pipeline
from utils.image_handler import ImageHandler
from flask_cors import CORS
import logging
from logger_config import setup_logging


setup_logging()
logger = logging.getLogger('flask_app')

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:4000"}})

@app.route("/api/", methods=['POST'])
def generate_depth():
    data = request.get_json()
    if (not data or 'image_urls' not in data or 'id' not in data or not isinstance(data['image_urls'], list)
    ):
        logger.error("No image urls or id provided or not in list")
        return jsonify({'error': 'No image urls or id provided or not in list'}), 400

    image_handler = ImageHandler(data['image_urls'], data['id'])
    images = image_handler.get()
    depth_url = image_handler.transform_and_upload(images)
    logger.info(f'Transformed and uploaded depth image {data["id"]}')

    return jsonify({'depth_url': depth_url})

@app.route("/api/glb", methods=['POST'])
def generate_glb():
    data = request.get_json()
    if (not data or 'image_urls' not in data or 'id' not in data or not isinstance(data['image_urls'], list)
    ):
        logger.error("No image urls or id provided or not in list")
        return jsonify({'error': 'No image urls or id provided or not in list'}), 400
    
    image = ImageHandler(data['image_urls'], data['id'])
    image.generate_glb()

    return jsonify({'glb': "response"})

if __name__ == '__main__':
    app.run(debug=True)