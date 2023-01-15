from io import BytesIO

import numpy as np
import tensorflow as tf
from PIL import Image

model = None
model_location = 'trooper-model'

def load_model():
    model = tf.keras.models.load_model(model_location)
    print("Model loaded")
    return model


def predict(image: Image.Image):
    global model
    if model is None:
        model = load_model()

    img_height = 180
    img_width = 180
    image = image.resize([img_width, img_height])
    img_array = tf.keras.utils.img_to_array(image)
    img_array = tf.expand_dims(img_array, 0) # Create a batch

    predictions = model.predict(img_array)
    
    score = tf.nn.softmax(predictions[0])

    class_names = ['vader', 'trooper'] # label texts are not saved in the model!
    class_name = class_names[np.argmax(score)]
    score = 100 * np.max(score)

    response = []    
    resp = {}
    resp["class"] = class_name
    resp["confidence"] = f"{score:0.2f} %"

    response.append(resp)
    return response
    

def read_imagefile(file) -> Image.Image:
    image = Image.open(BytesIO(file))
    return image
