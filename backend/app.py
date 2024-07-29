import io
import json
import torch

from torchvision import transforms
from PIL import Image
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from classes import caltech256Classes

app = Flask(__name__)

model = torch.jit.load("caltech256-script.zip", map_location="cpu")
model.eval()


def transform_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))

    if image.mode != 'RGB':
        image = image.convert('RGB')

    transform_image = transforms.Compose(
        [
            transforms.Resize(255),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ]
    )
    
    return transform_image(image).unsqueeze(0)


def get_prediction(image_bytes):
    tensor = transform_image(image_bytes)
    outputs = model.forward(tensor)
    _, y_hat = outputs.max(1)
    predicted_idx = y_hat.item()
    return caltech256Classes[predicted_idx]

CORS(app)

@app.route('/test-upload', methods=['POST'])
def test_upload():
    if 'file' not in request.files:
        return jsonify({
            'error': 'No file part in the request',
            'headers': str(request.headers),
            'form_data': str(request.form),
            'files': str(request.files)
        }), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    return jsonify({
        'message': 'File received successfully',
        'filename': file.filename
    })

@app.route("/predict", methods=["POST"])
def predict():
    i1 = f"Request headers: {request.headers}"
    i2 = f"Request form data: {request.form}"
    i3 = f"Request files: {request.files}"

    if "file" not in request.files:
        return (
            jsonify(
                {"error": "No file part in the request", "1": i1, "2": i2, "3": i3}
            ),
            400,
        )

    image = request.files["file"]
    if image.filename == "":
        return jsonify({"error": "No selected file"}), 400

    img_bytes = image.read()
    class_name = get_prediction(img_bytes)
    return jsonify({"class_name": class_name})


@app.route("/")
def hello():
    return "You've reached the root endpoint! Try /predict to make a prediction."


if __name__ == "__main__":
    app.run(host="0.0.0.0")
