# Let's break down the provided code and create the necessary FastAPI and HTML components to integrate the model.
# The key functions we'll use are `process_image_with_model`, which processes an image using the model and saves the output.
# We'll need to modify the FastAPI application to handle image uploads, pass the image to the model for processing, save the output,
# and then display the result on the webpage.

# First, here's the modified FastAPI application and HTML code that incorporates the model:

## FastAPI Script (`main.py`):

from fastapi import FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps
import io
import os
import glob
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import cv2
from sal_imp_utilities import UMSI_eval_generator, reverse_preprocess, postprocess_predictions



# Load the model when the script is initialized
weightsPath = 'model_full.h5'
model = tf.keras.models.load_model(weightsPath)

def padding(img, shape_r, shape_c, channels=3):
    img_padded = np.zeros((shape_r, shape_c, channels), dtype=np.uint8)
    if channels == 1:
        img_padded = np.zeros((shape_r, shape_c), dtype=np.uint8)

    original_shape = img.shape
    rows_rate = original_shape[0]/shape_r
    cols_rate = original_shape[1]/shape_c

    if rows_rate > cols_rate:
        new_cols = (original_shape[1] * shape_r) // original_shape[0]
        img = cv2.resize(img, (new_cols, shape_r))
        if new_cols > shape_c:
            new_cols = shape_c
        img_padded[:, ((img_padded.shape[1] - new_cols) // 2):((img_padded.shape[1] - new_cols) // 2 + new_cols)] = img
    else:
        new_rows = (original_shape[0] * shape_c) // original_shape[1]
        img = cv2.resize(img, (shape_c, new_rows))
        if new_rows > shape_r:
            new_rows = shape_r
        img_padded[((img_padded.shape[0] - new_rows) // 2):((img_padded.shape[0] - new_rows) // 2 + new_rows), :] = img

    return img_padded

def preprocess_images(paths, shape_r, shape_c, pad=True):
    if pad:
        ims = np.zeros((len(paths), shape_r, shape_c, 3))
    else:
        ims =[]

    for i, path in enumerate(paths):
        original_image = cv2.imread(path)
        if original_image is None:
            raise ValueError('Path unreadable: %s' % path)
        if pad:
            padded_image = padding(original_image, shape_r, shape_c, 3)
            ims[i] = padded_image
        else:
            original_image = original_image.astype(np.float32)
            original_image[..., 0] -= 103.939 #############
            original_image[..., 1] -= 116.779
            original_image[..., 2] -= 123.68
            ims.append(original_image)
            # ims = np.array(ims)
            print('ims.shape in preprocess_imgs',ims.shape)

    if pad:
        ims[:, :, :, 0] -= 103.939
        ims[:, :, :, 1] -= 116.779
        ims[:, :, :, 2] -= 123.68

    return ims

def overlay_heatmap_on_image(original_image, heatmap):
    # Overlay the heatmap on the original image
    superimposed_img = cv2.addWeighted(original_image, 0.6, heatmap, 0.4, 0)
    return superimposed_img


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  # Allows the specified origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)


@app.post("/heatmap3s/upload")
async def upload_image(file: UploadFile = File(...)):
    
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))

    if image.mode != 'RGB':
        image = image.convert('RGB')

    img = np.array(image)
    

    ims = np.zeros((1, 256, 256, 3))
    padded_image = padding(img, 256, 256, 3)
    ims[0] = padded_image

    ims[:, :, :, 0] -= 103.939
    ims[:, :, :, 1] -= 116.779
    ims[:, :, :, 2] -= 123.68


    # Step 4: Predict using the model
    preds = model.predict(ims)
    preds_map = preds[0][0]

    # Step 4: Resize the preds_map to match the original image size
    heatmap = cv2.resize(preds_map, (512, 512))

    # Step 5: Normalize and apply colormap to the heatmap
    heatmap = np.maximum(heatmap, 0)  # Ensure all values are positive
    heatmap /= heatmap.max()  # Normalize between 0 and 1
    heatmap = np.uint8(255 * heatmap)  # Scale to [0, 255]
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    # # Step 6: Overlay the heatmap on the original image
    # overlay_img = cv2.addWeighted(img, 0.6, heatmap, 0.4, 0)

    # Define the opacity level (alpha), where 1.0 is fully opaque and 0.0 is fully transparent
    alpha = 1  # 50% opacity

    # Create a blank white image with the same size as the original image
    background = np.ones_like(heatmap, dtype=np.uint8) * 255

    # Blend the image with the white background using the alpha value
    blended_image = cv2.addWeighted(heatmap, alpha, background, 1 - alpha, 0)

    
    # Step 6: Convert the result to bytes and return it
    _, img_encoded = cv2.imencode('.png', blended_image)
    img_bytes = io.BytesIO(img_encoded.tobytes())
    
    return StreamingResponse(img_bytes, media_type="image/png")


@app.get("/")
def root():
    return {"hello": "world"}